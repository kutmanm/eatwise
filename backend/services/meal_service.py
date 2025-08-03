from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from models.user import User
from models.meal import Meal
from schemas.meal import MealCreate, MealUpdate, PhotoAnalysisRequest, ChatLogRequest, DailyNutritionSummary, WeeklyProgressData
from services.ai_service import analyze_meal_photo, parse_meal_text
from services.user_service import check_freemium_limits
from datetime import datetime, timedelta, date
from fastapi import HTTPException, status

async def create_meal(user: User, meal_data: MealCreate, db: Session) -> Meal:
    limits_check = await check_freemium_limits(user, db, "meal_log")
    if not limits_check["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=limits_check["reason"]
        )
    
    meal = Meal(
        user_id=user.id,
        **meal_data.model_dump()
    )
    
    if not meal.logged_at:
        meal.logged_at = datetime.utcnow()
    
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal

async def get_user_meals(
    user: User, 
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Meal]:
    query = db.query(Meal).filter(Meal.user_id == user.id)
    
    if start_date:
        query = query.filter(Meal.logged_at >= start_date)
    if end_date:
        query = query.filter(Meal.logged_at <= end_date)
    
    return query.order_by(desc(Meal.logged_at)).offset(skip).limit(limit).all()

async def get_meal_by_id(user: User, meal_id: int, db: Session) -> Optional[Meal]:
    return db.query(Meal).filter(
        and_(Meal.id == meal_id, Meal.user_id == user.id)
    ).first()

async def update_meal(user: User, meal_id: int, meal_data: MealUpdate, db: Session) -> Optional[Meal]:
    meal = await get_meal_by_id(user, meal_id, db)
    if not meal:
        return None
    
    update_data = meal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(meal, field, value)
    
    db.commit()
    db.refresh(meal)
    return meal

async def delete_meal(user: User, meal_id: int, db: Session) -> bool:
    meal = await get_meal_by_id(user, meal_id, db)
    if not meal:
        return False
    
    db.delete(meal)
    db.commit()
    return True

async def analyze_photo(user: User, photo_request: PhotoAnalysisRequest, db: Session):
    analysis = await analyze_meal_photo(photo_request.image_url)
    return analysis

async def parse_chat_log(user: User, chat_request: ChatLogRequest, db: Session):
    analysis = await parse_meal_text(chat_request.description)
    return analysis

async def get_daily_nutrition_summary(user: User, target_date: date, db: Session) -> DailyNutritionSummary:
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date + timedelta(days=1), datetime.min.time())
    
    meals = db.query(Meal).filter(
        and_(
            Meal.user_id == user.id,
            Meal.logged_at >= start_datetime,
            Meal.logged_at < end_datetime
        )
    ).all()
    
    total_calories = sum(meal.calories or 0 for meal in meals)
    total_protein = sum(meal.protein or 0 for meal in meals)
    total_carbs = sum(meal.carbs or 0 for meal in meals)
    total_fat = sum(meal.fat or 0 for meal in meals)
    total_fiber = sum(meal.fiber or 0 for meal in meals)
    total_water = sum(meal.water or 0 for meal in meals)
    
    goals = {}
    if user.profile:
        from services.user_service import calculate_user_goals
        goals = await calculate_user_goals(user.profile)
    
    return DailyNutritionSummary(
        date=start_datetime,
        meal_count=len(meals),
        calories=total_calories,
        protein=total_protein,
        carbs=total_carbs,
        fat=total_fat,
        fiber=total_fiber,
        water=total_water,
        calorie_goal=goals.get("calorie_goal"),
        protein_goal=goals.get("protein"),
        carbs_goal=goals.get("carbs"),
        fat_goal=goals.get("fat")
    )

async def get_weekly_progress(user: User, week_start: date, db: Session) -> WeeklyProgressData:
    daily_summaries = []
    
    for i in range(7):
        current_date = week_start + timedelta(days=i)
        daily_summary = await get_daily_nutrition_summary(user, current_date, db)
        daily_summaries.append(daily_summary)
    
    total_calories = sum(day.calories or 0 for day in daily_summaries)
    total_protein = sum(day.protein or 0 for day in daily_summaries)
    total_carbs = sum(day.carbs or 0 for day in daily_summaries)
    total_fat = sum(day.fat or 0 for day in daily_summaries)
    
    days_with_meals = len([day for day in daily_summaries if day.meal_count > 0])
    
    return WeeklyProgressData(
        week_start=datetime.combine(week_start, datetime.min.time()),
        daily_summaries=daily_summaries,
        avg_calories=total_calories / max(days_with_meals, 1),
        avg_protein=total_protein / max(days_with_meals, 1),
        avg_carbs=total_carbs / max(days_with_meals, 1),
        avg_fat=total_fat / max(days_with_meals, 1)
    )

async def get_meal_calendar_data(user: User, month: int, year: int, db: Session) -> Dict[str, Any]:
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    meals = db.query(Meal).filter(
        and_(
            Meal.user_id == user.id,
            Meal.logged_at >= start_date,
            Meal.logged_at < end_date
        )
    ).all()
    
    calendar_data = {}
    for meal in meals:
        day = meal.logged_at.day
        if day not in calendar_data:
            calendar_data[day] = {
                "meal_count": 0,
                "total_calories": 0
            }
        
        calendar_data[day]["meal_count"] += 1
        calendar_data[day]["total_calories"] += meal.calories or 0
    
    return {
        "month": month,
        "year": year,
        "days": calendar_data
    }

async def get_recent_meals_for_ai(user: User, db: Session, limit: int = 5) -> List[Dict[str, Any]]:
    meals = db.query(Meal).filter(Meal.user_id == user.id).order_by(desc(Meal.logged_at)).limit(limit).all()
    
    return [
        {
            "description": meal.description,
            "calories": meal.calories,
            "protein": meal.protein,
            "carbs": meal.carbs,
            "fat": meal.fat,
            "logged_at": meal.logged_at
        }
        for meal in meals
    ]

async def search_meals(user: User, query: str, db: Session, limit: int = 20) -> List[Meal]:
    return db.query(Meal).filter(
        and_(
            Meal.user_id == user.id,
            Meal.description.ilike(f"%{query}%")
        )
    ).order_by(desc(Meal.logged_at)).limit(limit).all()