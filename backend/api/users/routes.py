from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.user import User
from schemas.user import User as UserSchema, UserUpdate, UserProfile, UserProfileCreate, UserProfileUpdate, Subscription
from services.auth_service import get_current_user
from services.user_service import (
    get_user_profile, create_user_profile, update_user_profile, 
    calculate_user_goals, update_user_email, get_user_subscription,
    check_subscription_status, get_user_streak, calculate_goal_achievement
)

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_data.email:
        updated_user = await update_user_email(current_user, user_data.email, db)
        return updated_user
    return current_user

@router.get("/profile", response_model=UserProfile)
async def get_user_profile_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = await get_user_profile(current_user, db)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return profile

@router.post("/profile", response_model=UserProfile)
async def create_user_profile_info(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = await create_user_profile(current_user, profile_data, db)
    return profile

@router.put("/profile", response_model=UserProfile)
async def update_user_profile_info(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = await update_user_profile(current_user, profile_data, db)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return profile

@router.get("/goals")
async def get_user_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = await get_user_profile(current_user, db)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return await calculate_user_goals(profile)

@router.get("/goal-achievement")
async def get_goal_achievement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить данные о прогрессе достижения цели для Goal Achievement диаграммы"""
    profile = await get_user_profile(current_user, db)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return await calculate_goal_achievement(profile)

@router.get("/subscription")
async def get_subscription_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subscription_status = await check_subscription_status(current_user, db)
    return subscription_status

@router.get("/streak")
async def get_user_streak_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    streak = await get_user_streak(current_user, db)
    return {"streak": streak}