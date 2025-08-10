from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from models.database import get_db
from models.user import User
from services.auth_service import get_current_user, require_premium
from models.diet_plan import DietPlanModel, WeeklySummary, PlanFeedback
from services.diet_plan_service import (
    generate_7_day_diet_plan,
    update_plan_after_feedback
)
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/diet-plans", tags=["diet-plans"])


class DietPlanGenerationRequest(BaseModel):
    symptoms_focus: Optional[List[str]] = None
    dietary_preferences: Optional[Dict[str, Any]] = None
    regenerate: bool = False


class WeeklyFeedbackRequest(BaseModel):
    week_start: str
    symptom_improvements: Optional[Dict[str, Any]] = None
    meal_satisfaction: Optional[int] = None  # 1-10 scale
    energy_levels: Optional[int] = None  # 1-10 scale
    plan_adherence: Optional[int] = None  # 1-10 scale
    specific_feedback: Optional[str] = None
    difficult_meals: Optional[List[str]] = None
    preferred_meals: Optional[List[str]] = None
    changes_made: Optional[List[str]] = None
    foods_triggering: Optional[List[str]] = None
    foods_helpful: Optional[List[str]] = None


class PlanEditRequest(BaseModel):
    date: str
    meal_type: str  # breakfast, lunch, dinner, snack
    new_meal: Dict[str, Any]


@router.post("/generate")
async def generate_diet_plan(
    request: DietPlanGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a personalized 7-day diet plan"""
    try:
        plan = await generate_7_day_diet_plan(
            user=current_user,
            db=db,
            symptoms_focus=request.symptoms_focus,
            dietary_preferences=request.dietary_preferences
        )
        
        if plan.get("success"):
            return plan
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=plan.get("error", "Failed to generate diet plan")
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating diet plan: {str(e)}"
        )


@router.get("/current")
async def get_current_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the user's current active diet plan"""
    # Fetch most recent week plan
    plan = db.query(DietPlanModel).filter(
        DietPlanModel.user_id == current_user.id
    ).order_by(DietPlanModel.week_start.desc()).first()

    if not plan:
        return {
            "has_plan": False,
            "message": "No active plan found. Generate a new plan to get started.",
            "user_id": str(current_user.id)
        }

    return {
        "has_plan": True,
        "plan": plan.plan,
        "week_start": plan.week_start.isoformat(),
    }


@router.post("/feedback")
async def submit_weekly_feedback(
    request: WeeklyFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit weekly feedback and get plan updates"""
    try:
        # Store feedback (in production, this would go to a feedback table)
        feedback_data = {
            "week_start": request.week_start,
            "symptom_improvements": request.symptom_improvements,
            "meal_satisfaction": request.meal_satisfaction,
            "energy_levels": request.energy_levels,
            "plan_adherence": request.plan_adherence,
            "specific_feedback": request.specific_feedback,
            "difficult_meals": request.difficult_meals,
            "preferred_meals": request.preferred_meals,
            "submitted_at": datetime.utcnow().isoformat()
        }
        
        # Persist structured feedback
        db.add(PlanFeedback(
            user_id=current_user.id,
            week_start=datetime.fromisoformat(request.week_start).date(),
            feedback=feedback_data
        ))
        db.commit()

        # Use feedback to generate recommendations
        mock_current_plan = {
            "summary": {
                "key_focus_areas": ["digestion", "energy"],
                "total_daily_calories": 1600
            }
        }
        
        recommendations = await update_plan_after_feedback(
            user=current_user,
            current_plan=mock_current_plan,
            feedback=feedback_data,
            db=db
        )
        
        return {
            "feedback_received": True,
            "recommendations": recommendations,
            "next_plan_generation": "Plan will be updated based on your feedback"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing feedback: {str(e)}"
        )


@router.put("/edit")
async def edit_plan_meal(
    request: PlanEditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Edit a specific meal in the diet plan"""
    try:
        plan = db.query(DietPlanModel).filter(
            DietPlanModel.user_id == current_user.id,
            DietPlanModel.week_start <= datetime.fromisoformat(request.date).date()
        ).order_by(DietPlanModel.week_start.desc()).first()

        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

        plan_data = plan.plan
        day = plan_data.get("days", {}).get(request.date)
        if not day:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found in plan")

        # Update meal
        day_meals = day.get("meals", {})
        day_meals[request.meal_type] = request.new_meal

        # Recalculate totals
        from services.diet_plan_service import _calculate_daily_totals  # reuse internal
        day["daily_totals"] = _calculate_daily_totals(day_meals)

        # Persist
        plan.plan = plan_data
        plan.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(plan)

        return {"success": True, "plan": plan.plan}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error editing meal: {str(e)}"
        )


@router.post("/meals/log-from-plan")
async def log_meal_from_plan(
    date: str,
    meal_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a meal from the diet plan to actual meal tracking"""
    try:
        plan = db.query(DietPlanModel).filter(
            DietPlanModel.user_id == current_user.id
        ).order_by(DietPlanModel.week_start.desc()).first()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

        day = plan.plan.get("days", {}).get(date)
        if not day:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not in plan")
        meal_data = day.get("meals", {}).get(meal_type)
        if not meal_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not in plan")

        # Create Meal
        from schemas.meal import MealCreate
        from services.meal_service import create_meal
        meal_create = MealCreate(
            description=meal_data.get("name") or meal_data.get("description"),
            calories=meal_data.get("calories"),
            protein=meal_data.get("protein"),
            carbs=meal_data.get("carbs"),
            fat=meal_data.get("fat"),
            meal_type=meal_type,
            logged_at=datetime.fromisoformat(date)
        )
        created = await create_meal(current_user, meal_create, db)
        return {"success": True, "meal_id": created.id}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error logging meal from plan: {str(e)}"
        )


@router.get("/summary/weekly")
async def get_weekly_summary(
    week_start: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly summary for plan evaluation"""
    try:
        if week_start:
            ws = datetime.fromisoformat(week_start).date()
        else:
            # default to current week Monday
            today = datetime.utcnow().date()
            ws = today - timedelta(days=today.weekday())

        # Return cached/generated summary if exists
        summary_row = db.query(WeeklySummary).filter(
            WeeklySummary.user_id == current_user.id,
            WeeklySummary.week_start == ws
        ).first()
        if summary_row:
            return summary_row.summary

        # Compute fresh summary
        from services.meal_service import get_weekly_progress
        from services.symptom_service import get_symptom_summary_stats
        weekly = await get_weekly_progress(current_user, ws, db)
        symptom = await get_symptom_summary_stats(current_user, db, date_range_days=7)

        computed = {
            "week_start": ws.isoformat(),
            "nutrition": {
                "avg_calories": weekly.avg_calories,
                "avg_protein": weekly.avg_protein,
                "avg_carbs": weekly.avg_carbs,
                "avg_fat": weekly.avg_fat,
            },
            "symptoms": symptom,
        }

        # Save for reuse
        db.add(WeeklySummary(user_id=current_user.id, week_start=ws, summary=computed))
        db.commit()
        return computed
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating weekly summary: {str(e)}"
        )

@router.get("/premium/deep-focus", dependencies=[Depends(require_premium)])
async def deep_focus_capabilities():
    return {"features": ["detailed symptom timelines", "onset/duration correlations", "advanced analytics"]}


