from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from models.user import User, UserProfile, Subscription, WeightLog, UserFeedback, UserRole
from schemas.user import UserProfileCreate, UserProfileUpdate, SubscriptionCreate, WeightLogCreate, WeightLogUpdate, UserFeedbackCreate
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
    # Use current_weight for BMR/TDEE calculations
    bmr = calculate_bmr(profile.age, profile.height, profile.current_weight, profile.gender == "male")
    tdee = calculate_tdee(bmr, profile.activity_level)
    calorie_goal = calculate_calorie_goal(profile.current_weight, profile.goal, tdee)
    macro_targets = calculate_macro_targets(calorie_goal, profile.goal)
    
    return {
        "bmr": bmr,
        "tdee": tdee,
        "calorie_goal": calorie_goal,
        "target_weight": profile.target_weight,
        "initial_weight": profile.initial_weight,
        "current_weight": profile.current_weight,
        "water_goal": profile.water_goal,
        **macro_targets
    }

async def get_user_subscription(user: User, db: Session) -> Optional[Subscription]:
    return db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status.in_(["active", "trialing"])
    ).first()

async def create_subscription(user: User, subscription_data: SubscriptionCreate, db: Session) -> Subscription:
    existing_subscription = await get_user_subscription(user, db)
    if existing_subscription:
        existing_subscription.status = "canceled"
        existing_subscription.end_date = datetime.utcnow()
    
    subscription = Subscription(
        user_id=user.id,
        plan=subscription_data.plan,
        start_date=datetime.utcnow(),
        status="active"
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
    
    subscription.status = "canceled"
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
        "status": subscription.status,
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

# Weight Log Services
async def create_weight_log(user: User, weight_data: WeightLogCreate, db: Session) -> WeightLog:
    weight_log = WeightLog(
        user_id=user.id,
        **weight_data.model_dump()
    )
    db.add(weight_log)
    db.commit()
    db.refresh(weight_log)
    
    # Update current_weight in user profile
    profile = await get_user_profile(user, db)
    if profile:
        profile.current_weight = weight_data.weight
        db.commit()
    
    return weight_log

async def get_user_weight_logs(user: User, db: Session, limit: int = 30) -> List[WeightLog]:
    return db.query(WeightLog).filter(
        WeightLog.user_id == user.id
    ).order_by(WeightLog.logged_at.desc()).limit(limit).all()

async def update_weight_log(user: User, weight_log_id: int, weight_data: WeightLogUpdate, db: Session) -> Optional[WeightLog]:
    weight_log = db.query(WeightLog).filter(
        WeightLog.id == weight_log_id,
        WeightLog.user_id == user.id
    ).first()
    
    if not weight_log:
        return None
    
    update_data = weight_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(weight_log, field, value)
    
    db.commit()
    db.refresh(weight_log)
    return weight_log

async def delete_weight_log(user: User, weight_log_id: int, db: Session) -> bool:
    weight_log = db.query(WeightLog).filter(
        WeightLog.id == weight_log_id,
        WeightLog.user_id == user.id
    ).first()
    
    if not weight_log:
        return False
    
    db.delete(weight_log)
    db.commit()
    return True

# UserFeedback Services
async def create_user_feedback(user: Optional[User], feedback_data: UserFeedbackCreate, db: Session) -> UserFeedback:
    feedback = UserFeedback(
        user_id=user.id if user else None,  # Allow anonymous feedback
        **feedback_data.model_dump()
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

async def get_user_feedback(user: User, db: Session, limit: int = 20) -> List[UserFeedback]:
    return db.query(UserFeedback).filter(
        UserFeedback.user_id == user.id
    ).order_by(UserFeedback.sent_at.desc()).limit(limit).all()