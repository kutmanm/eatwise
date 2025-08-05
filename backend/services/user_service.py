from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models.user import User, UserProfile, Subscription, UserRole
from schemas.user import UserProfileCreate, UserProfileUpdate, SubscriptionCreate
from utils.helpers import calculate_bmr, calculate_tdee, calculate_macro_targets, calculate_calorie_goal
from datetime import datetime, timedelta

async def get_user_profile(user: User, db: Session) -> Optional[UserProfile]:
    return db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

async def create_user_profile(user: User, profile_data: UserProfileCreate, db: Session) -> UserProfile:
    existing_profile = await get_user_profile(user, db)
    if existing_profile:
        db.delete(existing_profile)
        db.commit()
    
    profile = UserProfile(
        user_id=user.id,
        **profile_data.model_dump()
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

async def update_user_profile(user: User, profile_data: UserProfileUpdate, db: Session) -> Optional[UserProfile]:
    profile = await get_user_profile(user, db)
    if not profile:
        return None
    
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile

async def calculate_user_goals(profile: UserProfile) -> Dict[str, float]:
    bmr = calculate_bmr(profile.age, profile.height, profile.weight, True)
    tdee = calculate_tdee(bmr, profile.activity_level)
    calorie_goal = calculate_calorie_goal(profile.weight, profile.goal, tdee)
    macro_targets = calculate_macro_targets(calorie_goal, profile.goal)
    
    # Расчет прогресса к целевому весу
    weight_progress = 0.0
    if profile.target_weight:
        if profile.goal.value == "weight_loss":
            total_to_lose = profile.weight - profile.target_weight
            weight_progress = max(0.0, min(100.0, 0.0))  # Начальный прогресс 0%
        elif profile.goal.value == "muscle_gain":
            total_to_gain = profile.target_weight - profile.weight
            weight_progress = max(0.0, min(100.0, 0.0))  # Начальный прогресс 0%
        else:  # maintain
            weight_progress = 100.0 if abs(profile.weight - profile.target_weight) <= 1.0 else 0.0
    
    return {
        "bmr": bmr,
        "tdee": tdee,
        "calorie_goal": calorie_goal,
        "target_weight": profile.target_weight,
        "timeframe_days": profile.timeframe_days,
        "weight_progress": weight_progress,
        **macro_targets
    }

async def get_user_subscription(user: User, db: Session) -> Optional[Subscription]:
    return db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.active == True
    ).first()

async def create_subscription(user: User, subscription_data: SubscriptionCreate, db: Session) -> Subscription:
    existing_subscription = await get_user_subscription(user, db)
    if existing_subscription:
        existing_subscription.active = False
        existing_subscription.end_date = datetime.utcnow()
    
    subscription = Subscription(
        user_id=user.id,
        plan=subscription_data.plan,
        start_date=datetime.utcnow(),
        active=True
    )
    
    user.role = UserRole.PREMIUM
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

async def cancel_subscription(user: User, db: Session) -> bool:
    subscription = await get_user_subscription(user, db)
    if not subscription:
        return False
    
    subscription.active = False
    subscription.end_date = datetime.utcnow()
    user.role = UserRole.FREE
    
    db.commit()
    return True

async def check_subscription_status(user: User, db: Session) -> Dict[str, Any]:
    subscription = await get_user_subscription(user, db)
    
    if not subscription:
        return {
            "has_subscription": False,
            "plan": None,
            "status": "free",
            "expires_at": None
        }
    
    return {
        "has_subscription": True,
        "plan": subscription.plan,
        "status": "active" if subscription.active else "expired",
        "started_at": subscription.start_date,
        "expires_at": subscription.end_date
    }

async def get_user_streak(user: User, db: Session) -> int:
    from models.meal import Meal
    current_date = datetime.utcnow().date()
    streak = 0
    
    for i in range(365):
        check_date = current_date - timedelta(days=i)
        meals_count = db.query(Meal).filter(
            Meal.user_id == user.id,
            Meal.logged_at >= datetime.combine(check_date, datetime.min.time()),
            Meal.logged_at < datetime.combine(check_date + timedelta(days=1), datetime.min.time())
        ).count()
        
        if meals_count > 0:
            streak += 1
        else:
            break
    
    return streak

async def update_user_email(user: User, new_email: str, db: Session) -> User:
    user.email = new_email
    db.commit()
    db.refresh(user)
    return user

async def calculate_goal_achievement(profile: UserProfile) -> Dict[str, Any]:
    """Рассчитывает прогресс достижения цели для Goal Achievement диаграммы"""
    if not profile.target_weight or not profile.timeframe_days:
        return {
            "progress_percentage": 0.0,
            "days_remaining": 0,
            "weight_to_go": 0.0,
            "on_track": False,
            "daily_weight_change_needed": 0.0
        }
    
    current_weight = profile.weight
    target_weight = profile.target_weight
    
    # Расчет прогресса
    if profile.goal.value == "weight_loss":
        total_weight_change = current_weight - target_weight
        current_progress = 0.0  # Начальный прогресс
        weight_to_go = abs(current_weight - target_weight)
    elif profile.goal.value == "muscle_gain":
        total_weight_change = target_weight - current_weight
        current_progress = 0.0  # Начальный прогресс
        weight_to_go = abs(target_weight - current_weight)
    else:  # maintain
        return {
            "progress_percentage": 100.0 if abs(current_weight - target_weight) <= 1.0 else 0.0,
            "days_remaining": profile.timeframe_days,
            "weight_to_go": abs(current_weight - target_weight),
            "on_track": abs(current_weight - target_weight) <= 1.0,
            "daily_weight_change_needed": 0.0
        }
    
    progress_percentage = max(0.0, min(100.0, current_progress))
    daily_weight_change_needed = weight_to_go / profile.timeframe_days if profile.timeframe_days > 0 else 0.0
    
    # Определяем, на правильном ли пути пользователь
    # Пока что считаем что все на правильном пути (это можно улучшить с историей весов)
    on_track = True
    
    return {
        "progress_percentage": progress_percentage,
        "days_remaining": profile.timeframe_days,
        "weight_to_go": weight_to_go,
        "on_track": on_track,
        "daily_weight_change_needed": daily_weight_change_needed,
        "target_weight": target_weight,
        "current_weight": current_weight
    }