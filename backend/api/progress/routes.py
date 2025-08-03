from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from models.database import get_db
from models.user import User
from schemas.meal import DailyNutritionSummary, WeeklyProgressData
from services.auth_service import get_current_user
from services.meal_service import get_daily_nutrition_summary, get_weekly_progress, get_meal_calendar_data

router = APIRouter(prefix="/api/progress", tags=["progress"])

@router.get("/daily", response_model=DailyNutritionSummary)
async def get_daily_progress(
    target_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = await get_daily_nutrition_summary(current_user, target_date, db)
    return summary

@router.get("/weekly", response_model=WeeklyProgressData)
async def get_weekly_progress_data(
    week_start: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress = await get_weekly_progress(current_user, week_start, db)
    return progress

@router.get("/calendar")
async def get_calendar_data(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2030),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    calendar_data = await get_meal_calendar_data(current_user, month, year, db)
    return calendar_data