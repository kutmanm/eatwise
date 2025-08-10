from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from models.database import get_db
from models.user import User
from services.auth_service import get_current_user, require_premium
from services.symptom_service import (
    create_symptom_log, get_user_symptom_logs, get_symptom_log_by_id,
    update_symptom_log, delete_symptom_log, create_lifestyle_log,
    get_user_lifestyle_logs, get_lifestyle_log_by_id, update_lifestyle_log,
    delete_lifestyle_log, get_symptom_correlation_data, get_symptom_summary_stats
)
from services.quick_log_service import quick_log_symptom, get_quick_log_suggestions
from services.minimal_habits_service import log_minimal_habits, get_habit_trends, get_today_habits, MinimalHabitLog
from services.auth_service import get_current_user, require_premium
from schemas.symptom import (
    SymptomLog, SymptomLogCreate, SymptomLogUpdate,
    LifestyleLog, LifestyleLogCreate, LifestyleLogUpdate,
    SymptomCorrelationData, SymptomAnalysisRequest
)
from models.symptom import SymptomType, SymptomDomain
from services.validation_service import DataValidator

router = APIRouter(prefix="/api/symptoms", tags=["symptoms"])


class QuickSymptomLogRequest(BaseModel):
    symptom_type: str
    severity: int = Field(ge=1, le=10)
    link_to_latest_meal: bool = True
    notes: Optional[str] = None


# Quick Logging
@router.post("/quick-log")
async def quick_log_symptom_endpoint(
    request: QuickSymptomLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Quick symptom logging with automatic meal linking"""
    result = await quick_log_symptom(
        user=current_user,
        symptom_type=request.symptom_type,
        severity=request.severity,
        db=db,
        link_to_latest_meal=request.link_to_latest_meal,
        notes=request.notes
    )
    
    if result.get("success"):
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to log symptom")
        )


@router.get("/quick-log/suggestions")
async def get_quick_log_suggestions_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get suggestions for quick symptom logging"""
    suggestions = await get_quick_log_suggestions(current_user, db)
    return suggestions


# Symptom Logs
@router.post("/logs", response_model=SymptomLog)
async def create_symptom_log_entry(
    symptom_data: SymptomLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new symptom log entry"""
    try:
        symptom_log = await create_symptom_log(current_user, symptom_data, db)
        # Run lightweight validation asynchronously
        validator = DataValidator()
        # Fire-and-forget pattern is not ideal; here we just compute quickly for last 7 days
        await validator.validate_symptom_data(current_user, db, days=7)
        return symptom_log
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create symptom log: {str(e)}"
        )


@router.get("/logs", response_model=List[SymptomLog])
async def get_symptom_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symptom_domain: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get symptom logs for the current user"""
    start_datetime = None
    end_datetime = None
    
    if start_date:
        try:
            start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if end_date:
        try:
            end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    symptom_logs = await get_user_symptom_logs(
        current_user, db, skip, limit, start_datetime, end_datetime, symptom_domain
    )
    return symptom_logs


@router.get("/logs/{symptom_id}", response_model=SymptomLog)
async def get_symptom_log(
    symptom_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific symptom log"""
    symptom_log = await get_symptom_log_by_id(current_user, symptom_id, db)
    if not symptom_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom log not found"
        )
    return symptom_log


@router.put("/logs/{symptom_id}", response_model=SymptomLog)
async def update_symptom_log_entry(
    symptom_id: int,
    symptom_data: SymptomLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a symptom log entry"""
    symptom_log = await update_symptom_log(current_user, symptom_id, symptom_data, db)
    if not symptom_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom log not found"
        )
    return symptom_log


@router.delete("/logs/{symptom_id}")
async def delete_symptom_log_entry(
    symptom_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a symptom log entry"""
    success = await delete_symptom_log(current_user, symptom_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom log not found"
        )
    return {"message": "Symptom log deleted successfully"}


# Lifestyle Logs
@router.post("/lifestyle", response_model=LifestyleLog, dependencies=[Depends(require_premium)])
async def create_lifestyle_log_entry(
    lifestyle_data: LifestyleLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new lifestyle log entry"""
    try:
        lifestyle_log = await create_lifestyle_log(current_user, lifestyle_data, db)
        return lifestyle_log
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create lifestyle log: {str(e)}"
        )


@router.get("/lifestyle", response_model=List[LifestyleLog], dependencies=[Depends(require_premium)])
async def get_lifestyle_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lifestyle logs for the current user"""
    start_datetime = None
    end_datetime = None
    
    if start_date:
        try:
            start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if end_date:
        try:
            end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    lifestyle_logs = await get_user_lifestyle_logs(
        current_user, db, skip, limit, start_datetime, end_datetime
    )
    return lifestyle_logs


@router.get("/lifestyle/{lifestyle_id}", response_model=LifestyleLog, dependencies=[Depends(require_premium)])
async def get_lifestyle_log(
    lifestyle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific lifestyle log"""
    lifestyle_log = await get_lifestyle_log_by_id(current_user, lifestyle_id, db)
    if not lifestyle_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lifestyle log not found"
        )
    return lifestyle_log


@router.put("/lifestyle/{lifestyle_id}", response_model=LifestyleLog, dependencies=[Depends(require_premium)])
async def update_lifestyle_log_entry(
    lifestyle_id: int,
    lifestyle_data: LifestyleLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a lifestyle log entry"""
    lifestyle_log = await update_lifestyle_log(current_user, lifestyle_id, lifestyle_data, db)
    if not lifestyle_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lifestyle log not found"
        )
    return lifestyle_log


@router.delete("/lifestyle/{lifestyle_id}", dependencies=[Depends(require_premium)])
async def delete_lifestyle_log_entry(
    lifestyle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a lifestyle log entry"""
    success = await delete_lifestyle_log(current_user, lifestyle_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lifestyle log not found"
        )
    return {"message": "Lifestyle log deleted successfully"}


# Analysis and Insights
@router.post("/analysis", response_model=SymptomCorrelationData, dependencies=[Depends(require_premium)])
async def analyze_symptom_correlations(
    request: SymptomAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get correlation analysis between symptoms, lifestyle, and meals"""
    correlation_data = await get_symptom_correlation_data(
        current_user, db, request.date_range_days, request.symptom_domain
    )
    return correlation_data


@router.get("/summary")
async def get_symptom_summary(
    days: int = Query(30, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get summary statistics for user's symptoms"""
    summary = await get_symptom_summary_stats(current_user, db, days)
    return summary


# Reference data endpoints
@router.get("/types")
async def get_symptom_types():
    """Get available symptom types"""
    return {
        "symptom_types": [
            {"value": symptom.value, "label": symptom.value.replace('_', ' ').title()}
            for symptom in SymptomType
        ]
    }


@router.get("/domains")
async def get_symptom_domains():
    """Get available symptom domains"""
    return {
        "symptom_domains": [
            {"value": domain.value, "label": domain.value.replace('_', ' ').title()}
            for domain in SymptomDomain
        ]
    }


# Minimal Habit Tracking (Water & Sleep)
@router.post("/habits/minimal")
async def log_minimal_habits_endpoint(
    habit_data: MinimalHabitLog,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log minimal habits (water and sleep only)"""
    result = await log_minimal_habits(current_user, habit_data, db)
    
    if result.get("success"):
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to log habits")
        )


@router.get("/habits/trends")
async def get_habit_trends_endpoint(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get habit trends for the specified number of days"""
    trends = await get_habit_trends(current_user, db, days)
    return trends


@router.get("/habits/today")
async def get_today_habits_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's habit logging status"""
    today_habits = await get_today_habits(current_user, db)
    return today_habits
