from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db
from models.user import User
from services.auth_service import get_current_user, require_premium
from services.ai_service import generate_meal_feedback, generate_daily_tip, answer_nutrition_question, suggest_meal_improvements
from services.meal_service import get_recent_meals_for_ai, get_daily_nutrition_summary, get_meal_by_id
from services.user_service import check_freemium_limits
from datetime import date

router = APIRouter(prefix="/api/ai", tags=["ai"])

class MealFeedbackRequest(BaseModel):
    meal_id: int

class NutritionQuestionRequest(BaseModel):
    question: str

class MealAdjustmentRequest(BaseModel):
    meal_id: int

@router.post("/feedback")
async def get_meal_feedback(
    request: MealFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = await get_meal_by_id(current_user, request.meal_id, db)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    
    today = date.today()
    daily_summary = await get_daily_nutrition_summary(current_user, today, db)
    
    meal_data = {
        "description": meal.description,
        "calories": meal.calories,
        "protein": meal.protein,
        "carbs": meal.carbs,
        "fat": meal.fat
    }
    
    daily_totals = {
        "calories": daily_summary.calories,
        "protein": daily_summary.protein,
        "carbs": daily_summary.carbs,
        "fat": daily_summary.fat
    }
    
    feedback = await generate_meal_feedback(meal_data, current_user, daily_totals)
    return {"feedback": feedback}

@router.get("/daily-tip")
async def get_daily_tip(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recent_meals = await get_recent_meals_for_ai(current_user, db, limit=5)
    tip = await generate_daily_tip(current_user, recent_meals)
    return {"tip": tip}

@router.post("/qna")
async def nutrition_qna(
    request: NutritionQuestionRequest,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db)
):
    limits_check = await check_freemium_limits(current_user, db, "ai_chat")
    if not limits_check["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=limits_check["reason"]
        )
    
    answer = await answer_nutrition_question(request.question, current_user)
    return {"answer": answer}

@router.post("/meal-adjustment")
async def get_meal_suggestions(
    request: MealAdjustmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = await get_meal_by_id(current_user, request.meal_id, db)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    
    meal_data = {
        "description": meal.description,
        "calories": meal.calories,
        "protein": meal.protein,
        "carbs": meal.carbs,
        "fat": meal.fat
    }
    
    suggestions = await suggest_meal_improvements(meal_data, current_user)
    return {"suggestions": suggestions}