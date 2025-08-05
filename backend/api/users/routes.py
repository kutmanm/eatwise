from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.user import User, UserFeedback
from typing import List
from schemas.user import (
    User as UserSchema, UserUpdate, UserProfile, UserProfileCreate, UserProfileUpdate, 
    Subscription, WeightLog, WeightLogCreate, WeightLogUpdate, 
    UserFeedback as UserFeedbackSchema, UserFeedbackCreate
)
from services.auth_service import get_current_user, get_current_user_optional
from services.user_service import (
    get_user_profile, create_user_profile, update_user_profile, 
    calculate_user_goals, update_user_email, get_user_subscription,
    check_subscription_status, get_user_streak, create_weight_log,
    get_user_weight_logs, update_weight_log, delete_weight_log,
    create_user_feedback, get_user_feedback
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
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Creating profile for user {current_user.id} with data: {profile_data.dict()}")
    
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
    
    goals = await calculate_user_goals(profile)
    return goals

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

# Weight Log endpoints
@router.post("/weight-logs", response_model=WeightLog)
async def create_weight_log_entry(
    weight_data: WeightLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    weight_log = await create_weight_log(current_user, weight_data, db)
    return weight_log

@router.get("/weight-logs", response_model=List[WeightLog])
async def get_weight_logs(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    weight_logs = await get_user_weight_logs(current_user, db, limit)
    return weight_logs

@router.put("/weight-logs/{weight_log_id}", response_model=WeightLog)
async def update_weight_log_entry(
    weight_log_id: int,
    weight_data: WeightLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    weight_log = await update_weight_log(current_user, weight_log_id, weight_data, db)
    if not weight_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight log not found"
        )
    return weight_log

@router.delete("/weight-logs/{weight_log_id}")
async def delete_weight_log_entry(
    weight_log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = await delete_weight_log(current_user, weight_log_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight log not found"
        )
    return {"message": "Weight log deleted successfully"}

# User Feedback endpoints
@router.post("/feedback", response_model=UserFeedbackSchema)
async def create_user_feedback_entry(
    feedback_data: UserFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Create user feedback entry - allows both authenticated and anonymous users"""
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Creating feedback: user_id={current_user.id if current_user else None}, message_length={len(feedback_data.message)}")
        
        # Use the service layer instead of direct DB operations
        feedback = await create_user_feedback(current_user, feedback_data, db)
        
        logger.info(f"Feedback created successfully with ID: {feedback.id}")
        return feedback
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating feedback: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create feedback: {str(e)}"
        )

@router.get("/feedback", response_model=List[UserFeedbackSchema])
async def get_user_feedback_entries(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user feedback entries - only for authenticated users"""
    feedback_entries = await get_user_feedback(current_user, db, limit)
    return feedback_entries