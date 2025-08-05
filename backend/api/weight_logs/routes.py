from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.user import User
from typing import List
from schemas.user import WeightLog, WeightLogCreate, WeightLogUpdate
from services.auth_service import get_current_user
from services.user_service import (
    create_weight_log, get_user_weight_logs, update_weight_log, delete_weight_log
)

router = APIRouter(prefix="/api/weight-logs", tags=["weight-logs"])

@router.post("/", response_model=WeightLog)
async def create_weight_log_entry(
    weight_data: WeightLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new weight log entry"""
    weight_log = await create_weight_log(current_user, weight_data, db)
    return weight_log

@router.get("/", response_model=List[WeightLog])
async def get_weight_logs(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's weight logs"""
    weight_logs = await get_user_weight_logs(current_user, db, limit)
    return weight_logs

@router.put("/{weight_log_id}", response_model=WeightLog)
async def update_weight_log_entry(
    weight_log_id: int,
    weight_data: WeightLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a weight log entry"""
    weight_log = await update_weight_log(current_user, weight_log_id, weight_data, db)
    if not weight_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight log not found"
        )
    return weight_log

@router.delete("/{weight_log_id}")
async def delete_weight_log_entry(
    weight_log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a weight log entry"""
    success = await delete_weight_log(current_user, weight_log_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight log not found"
        )
    return {"message": "Weight log deleted successfully"}

@router.get("/stats")
async def get_weight_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weight statistics and trends"""
    weight_logs = await get_user_weight_logs(current_user, db, limit=90)  # Last 90 entries
    
    if not weight_logs:
        return {
            "total_entries": 0,
            "latest_weight": None,
            "weight_change": None,
            "trend": None
        }
    
    latest_weight = weight_logs[0].weight
    oldest_weight = weight_logs[-1].weight if len(weight_logs) > 1 else latest_weight
    weight_change = latest_weight - oldest_weight
    
    # Simple trend calculation
    if len(weight_logs) >= 3:
        recent_avg = sum(log.weight for log in weight_logs[:3]) / 3
        older_avg = sum(log.weight for log in weight_logs[-3:]) / 3
        trend = "decreasing" if recent_avg < older_avg else "increasing" if recent_avg > older_avg else "stable"
    else:
        trend = "insufficient_data"
    
    return {
        "total_entries": len(weight_logs),
        "latest_weight": latest_weight,
        "weight_change": round(weight_change, 2),
        "trend": trend,
        "entries_count": len(weight_logs)
    }