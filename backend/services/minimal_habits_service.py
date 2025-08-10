from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from models.user import User
from models.symptom import LifestyleLog
from schemas.symptom import LifestyleLogCreate
from datetime import datetime, timedelta, date
from pydantic import BaseModel


class MinimalHabitLog(BaseModel):
    date: str  # YYYY-MM-DD format
    water_intake: Optional[float] = None  # liters
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None  # 1-10 scale


async def log_minimal_habits(
    user: User,
    habit_data: MinimalHabitLog,
    db: Session
) -> Dict[str, Any]:
    """Log minimal habits (water and sleep only)"""
    
    try:
        # Parse date
        log_date = datetime.strptime(habit_data.date, "%Y-%m-%d")
        
        # Check if log already exists for this date
        existing_log = db.query(LifestyleLog).filter(
            and_(
                LifestyleLog.user_id == user.id,
                LifestyleLog.date >= log_date,
                LifestyleLog.date < log_date + timedelta(days=1)
            )
        ).first()
        
        if existing_log:
            # Update existing log
            if habit_data.water_intake is not None:
                existing_log.water_intake = habit_data.water_intake
            if habit_data.sleep_hours is not None:
                existing_log.sleep_hours = habit_data.sleep_hours
            if habit_data.sleep_quality is not None:
                existing_log.sleep_quality = habit_data.sleep_quality
            
            db.commit()
            db.refresh(existing_log)
            
            return {
                "success": True,
                "action": "updated",
                "log_id": existing_log.id,
                "habits": {
                    "water_intake": existing_log.water_intake,
                    "sleep_hours": existing_log.sleep_hours,
                    "sleep_quality": existing_log.sleep_quality
                }
            }
        else:
            # Create new log with minimal data
            lifestyle_data = LifestyleLogCreate(
                date=log_date,
                water_intake=habit_data.water_intake,
                sleep_hours=habit_data.sleep_hours,
                sleep_quality=habit_data.sleep_quality,
                notes="Minimal habit tracking"
            )
            
            lifestyle_log = LifestyleLog(
                user_id=user.id,
                **lifestyle_data.model_dump()
            )
            
            db.add(lifestyle_log)
            db.commit()
            db.refresh(lifestyle_log)
            
            return {
                "success": True,
                "action": "created",
                "log_id": lifestyle_log.id,
                "habits": {
                    "water_intake": lifestyle_log.water_intake,
                    "sleep_hours": lifestyle_log.sleep_hours,
                    "sleep_quality": lifestyle_log.sleep_quality
                }
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to log habits: {str(e)}"
        }


async def get_habit_trends(
    user: User,
    db: Session,
    days: int = 7
) -> Dict[str, Any]:
    """Get minimal habit trends for the past X days"""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    logs = db.query(LifestyleLog).filter(
        and_(
            LifestyleLog.user_id == user.id,
            LifestyleLog.date >= start_date,
            LifestyleLog.date <= end_date
        )
    ).order_by(LifestyleLog.date).all()
    
    # Prepare daily data
    daily_habits = []
    water_values = []
    sleep_hours_values = []
    sleep_quality_values = []
    
    for i in range(days):
        current_date = (start_date + timedelta(days=i)).date()
        
        # Find log for this date
        day_log = next((log for log in logs if log.date.date() == current_date), None)
        
        day_data = {
            "date": current_date.isoformat(),
            "water_intake": day_log.water_intake if day_log else None,
            "sleep_hours": day_log.sleep_hours if day_log else None,
            "sleep_quality": day_log.sleep_quality if day_log else None,
            "logged": day_log is not None
        }
        
        daily_habits.append(day_data)
        
        # Collect values for averages
        if day_log:
            if day_log.water_intake:
                water_values.append(day_log.water_intake)
            if day_log.sleep_hours:
                sleep_hours_values.append(day_log.sleep_hours)
            if day_log.sleep_quality:
                sleep_quality_values.append(day_log.sleep_quality)
    
    # Calculate averages and insights
    averages = {
        "water_intake": round(sum(water_values) / len(water_values), 1) if water_values else None,
        "sleep_hours": round(sum(sleep_hours_values) / len(sleep_hours_values), 1) if sleep_hours_values else None,
        "sleep_quality": round(sum(sleep_quality_values) / len(sleep_quality_values), 1) if sleep_quality_values else None
    }
    
    # Generate insights
    insights = _generate_habit_insights(averages, daily_habits)
    
    return {
        "period_days": days,
        "daily_habits": daily_habits,
        "averages": averages,
        "insights": insights,
        "logging_consistency": {
            "days_logged": len([d for d in daily_habits if d["logged"]]),
            "total_days": days,
            "percentage": round(len([d for d in daily_habits if d["logged"]]) / days * 100, 1)
        }
    }


def _generate_habit_insights(averages: Dict[str, Any], daily_habits: List[Dict[str, Any]]) -> List[str]:
    """Generate insights based on habit patterns"""
    insights = []
    
    # Water intake insights
    if averages["water_intake"]:
        if averages["water_intake"] < 1.5:
            insights.append("💧 Try to increase water intake - aim for at least 2L daily")
        elif averages["water_intake"] >= 2.5:
            insights.append("💧 Great hydration! You're drinking plenty of water")
        else:
            insights.append("💧 Good water intake - keep it consistent")
    
    # Sleep insights
    if averages["sleep_hours"]:
        if averages["sleep_hours"] < 6:
            insights.append("😴 Consider getting more sleep - aim for 7-9 hours nightly")
        elif averages["sleep_hours"] > 9:
            insights.append("😴 You're getting plenty of sleep, which is great for recovery")
        else:
            insights.append("😴 Good sleep duration - quality is just as important")
    
    if averages["sleep_quality"]:
        if averages["sleep_quality"] < 6:
            insights.append("🌙 Focus on sleep quality - consider your evening routine")
        elif averages["sleep_quality"] >= 8:
            insights.append("🌙 Excellent sleep quality! This supports overall health")
    
    # Pattern insights
    recent_days = daily_habits[-3:]  # Last 3 days
    
    # Check for consistency
    water_logged = sum(1 for day in recent_days if day["water_intake"])
    sleep_logged = sum(1 for day in recent_days if day["sleep_hours"])
    
    if water_logged == 0 and sleep_logged == 0:
        insights.append("📊 Try logging your habits daily for better insights")
    elif water_logged >= 2 and sleep_logged >= 2:
        insights.append("📊 Great consistency with habit tracking!")
    
    return insights[:4]  # Limit to 4 insights


async def get_today_habits(user: User, db: Session) -> Dict[str, Any]:
    """Get today's habit logging status"""
    
    today = datetime.utcnow().date()
    
    today_log = db.query(LifestyleLog).filter(
        and_(
            LifestyleLog.user_id == user.id,
            LifestyleLog.date >= datetime.combine(today, datetime.min.time()),
            LifestyleLog.date < datetime.combine(today + timedelta(days=1), datetime.min.time())
        )
    ).first()
    
    # Get user's water goal from profile
    water_goal = 2.0  # Default 2L
    if user.profile and user.profile.water_goal:
        water_goal = user.profile.water_goal / 1000  # Convert from ml to liters
    
    return {
        "date": today.isoformat(),
        "logged": today_log is not None,
        "water_intake": today_log.water_intake if today_log else None,
        "water_goal": water_goal,
        "water_progress": round((today_log.water_intake / water_goal) * 100, 1) if today_log and today_log.water_intake else 0,
        "sleep_hours": today_log.sleep_hours if today_log else None,
        "sleep_quality": today_log.sleep_quality if today_log else None,
        "recommended_sleep": "7-9 hours",
        "quick_log_options": {
            "water_presets": [0.5, 1.0, 1.5, 2.0, 2.5, 3.0],  # liters
            "sleep_presets": [6, 6.5, 7, 7.5, 8, 8.5, 9],  # hours
            "quality_scale": list(range(1, 11))  # 1-10
        }
    }


def get_habit_summary_for_ai(habit_data: List[Dict[str, Any]]) -> str:
    """Format habit data for AI analysis"""
    if not habit_data:
        return "No recent habit data available"
    
    water_days = [d for d in habit_data if d.get("water_intake")]
    sleep_days = [d for d in habit_data if d.get("sleep_hours")]
    
    summary_parts = []
    
    if water_days:
        avg_water = sum(d["water_intake"] for d in water_days) / len(water_days)
        summary_parts.append(f"Average water intake: {avg_water:.1f}L/day ({len(water_days)} days logged)")
    
    if sleep_days:
        avg_sleep = sum(d["sleep_hours"] for d in sleep_days) / len(sleep_days)
        avg_quality = sum(d.get("sleep_quality", 5) for d in sleep_days) / len(sleep_days)
        summary_parts.append(f"Average sleep: {avg_sleep:.1f}h/night, quality: {avg_quality:.1f}/10 ({len(sleep_days)} days logged)")
    
    return " | ".join(summary_parts) if summary_parts else "Minimal habit data available"
