from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.user import User
from services.auth_service import get_current_user
from services.streamlined_onboarding_service import (
    StreamlinedOnboardingData,
    process_streamlined_onboarding,
    get_onboarding_options
)

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


@router.get("/options")
async def get_onboarding_options_endpoint():
    """Get all available onboarding options"""
    return get_onboarding_options()


@router.post("/streamlined")
async def complete_streamlined_onboarding(
    onboarding_data: StreamlinedOnboardingData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete streamlined onboarding process"""
    try:
        result = await process_streamlined_onboarding(
            user=current_user,
            onboarding_data=onboarding_data,
            db=db
        )
        
        if result.get("success"):
            return result
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to complete onboarding")
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during onboarding: {str(e)}"
        )


@router.get("/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has completed onboarding"""
    
    # Check if user has a profile
    has_profile = current_user.profile is not None
    
    if has_profile:
        # Check onboarding completeness
        profile = current_user.profile
        diet_prefs = profile.diet_preferences or {}
        
        is_streamlined = diet_prefs.get("onboarding_version") == "streamlined_v1"
        has_symptom_focus = bool(diet_prefs.get("symptom_focus"))
        
        return {
            "onboarding_complete": True,
            "onboarding_type": "streamlined" if is_streamlined else "full",
            "profile_created": True,
            "symptom_focus_set": has_symptom_focus,
            "next_steps": [
                {
                    "action": "generate_meal_plan",
                    "title": "Generate Your Meal Plan",
                    "completed": False  # This would check if user has generated a plan
                },
                {
                    "action": "log_first_meal",
                    "title": "Log Your First Meal",
                    "completed": False  # This would check recent meals
                }
            ]
        }
    else:
        return {
            "onboarding_complete": False,
            "profile_created": False,
            "recommended_flow": "streamlined",
            "estimated_time": "2 minutes"
        }
