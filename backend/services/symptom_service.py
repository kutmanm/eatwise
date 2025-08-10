from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func, case
from models.user import User
from models.symptom import SymptomLog, LifestyleLog, SymptomType, SymptomDomain
from models.meal import Meal
from schemas.symptom import (
    SymptomLogCreate, SymptomLogUpdate, LifestyleLogCreate, LifestyleLogUpdate,
    SymptomCorrelationData, SymptomInsight
)
from datetime import datetime, timedelta, date
from fastapi import HTTPException, status
import json


async def create_symptom_log(user: User, symptom_data: SymptomLogCreate, db: Session) -> SymptomLog:
    """Create a new symptom log entry"""
    symptom_log = SymptomLog(
        user_id=user.id,
        **symptom_data.model_dump()
    )
    
    db.add(symptom_log)
    db.commit()
    db.refresh(symptom_log)
    return symptom_log


async def get_user_symptom_logs(
    user: User,
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symptom_domain: Optional[str] = None
) -> List[SymptomLog]:
    """Get symptom logs for a user with optional filtering"""
    query = db.query(SymptomLog).filter(SymptomLog.user_id == user.id)
    
    if start_date:
        query = query.filter(SymptomLog.occurred_at >= start_date)
    if end_date:
        query = query.filter(SymptomLog.occurred_at <= end_date)
    if symptom_domain:
        query = query.filter(SymptomLog.symptom_domain == symptom_domain)
    
    return query.order_by(desc(SymptomLog.occurred_at)).offset(skip).limit(limit).all()


async def get_symptom_log_by_id(user: User, symptom_id: int, db: Session) -> Optional[SymptomLog]:
    """Get a specific symptom log by ID"""
    return db.query(SymptomLog).filter(
        and_(SymptomLog.id == symptom_id, SymptomLog.user_id == user.id)
    ).first()


async def update_symptom_log(
    user: User, 
    symptom_id: int, 
    symptom_data: SymptomLogUpdate, 
    db: Session
) -> Optional[SymptomLog]:
    """Update a symptom log entry"""
    symptom_log = await get_symptom_log_by_id(user, symptom_id, db)
    if not symptom_log:
        return None
    
    update_data = symptom_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(symptom_log, field, value)
    
    db.commit()
    db.refresh(symptom_log)
    return symptom_log


async def delete_symptom_log(user: User, symptom_id: int, db: Session) -> bool:
    """Delete a symptom log entry"""
    symptom_log = await get_symptom_log_by_id(user, symptom_id, db)
    if not symptom_log:
        return False
    
    db.delete(symptom_log)
    db.commit()
    return True


async def create_lifestyle_log(user: User, lifestyle_data: LifestyleLogCreate, db: Session) -> LifestyleLog:
    """Create a new lifestyle log entry"""
    lifestyle_log = LifestyleLog(
        user_id=user.id,
        **lifestyle_data.model_dump()
    )
    
    db.add(lifestyle_log)
    db.commit()
    db.refresh(lifestyle_log)
    return lifestyle_log


async def get_user_lifestyle_logs(
    user: User,
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[LifestyleLog]:
    """Get lifestyle logs for a user with optional filtering"""
    query = db.query(LifestyleLog).filter(LifestyleLog.user_id == user.id)
    
    if start_date:
        query = query.filter(LifestyleLog.date >= start_date)
    if end_date:
        query = query.filter(LifestyleLog.date <= end_date)
    
    return query.order_by(desc(LifestyleLog.date)).offset(skip).limit(limit).all()


async def get_lifestyle_log_by_id(user: User, lifestyle_id: int, db: Session) -> Optional[LifestyleLog]:
    """Get a specific lifestyle log by ID"""
    return db.query(LifestyleLog).filter(
        and_(LifestyleLog.id == lifestyle_id, LifestyleLog.user_id == user.id)
    ).first()


async def update_lifestyle_log(
    user: User,
    lifestyle_id: int,
    lifestyle_data: LifestyleLogUpdate,
    db: Session
) -> Optional[LifestyleLog]:
    """Update a lifestyle log entry"""
    lifestyle_log = await get_lifestyle_log_by_id(user, lifestyle_id, db)
    if not lifestyle_log:
        return None
    
    update_data = lifestyle_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lifestyle_log, field, value)
    
    db.commit()
    db.refresh(lifestyle_log)
    return lifestyle_log


async def delete_lifestyle_log(user: User, lifestyle_id: int, db: Session) -> bool:
    """Delete a lifestyle log entry"""
    lifestyle_log = await get_lifestyle_log_by_id(user, lifestyle_id, db)
    if not lifestyle_log:
        return False
    
    db.delete(lifestyle_log)
    db.commit()
    return True


async def get_symptom_correlation_data(
    user: User,
    db: Session,
    date_range_days: int = 7,
    symptom_domain: Optional[str] = None
) -> SymptomCorrelationData:
    """Get comprehensive data for symptom correlation analysis"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=date_range_days)
    
    # Get symptom logs
    symptom_logs = await get_user_symptom_logs(
        user, db, start_date=start_date, end_date=end_date, 
        symptom_domain=symptom_domain, limit=1000
    )
    
    # Get lifestyle logs
    lifestyle_logs = await get_user_lifestyle_logs(
        user, db, start_date=start_date, end_date=end_date, limit=1000
    )
    
    # Get meal data
    meals = db.query(Meal).filter(
        and_(
            Meal.user_id == user.id,
            Meal.logged_at >= start_date,
            Meal.logged_at <= end_date
        )
    ).order_by(Meal.logged_at).all()
    
    meal_data = [
        {
            "id": meal.id,
            "description": meal.description,
            "calories": meal.calories,
            "protein": meal.protein,
            "carbs": meal.carbs,
            "fat": meal.fat,
            "fiber": meal.fiber,
            "logged_at": meal.logged_at
        }
        for meal in meals
    ]
    
    # Analyze patterns (enhanced analysis with temporal correlation)
    patterns = await _analyze_symptom_patterns(symptom_logs, lifestyle_logs, meal_data)
    
    # Add temporal correlation analysis
    temporal_patterns = await _analyze_temporal_correlations(user, symptom_logs, db)
    patterns.extend(temporal_patterns)
    
    return SymptomCorrelationData(
        symptom_logs=symptom_logs,
        lifestyle_logs=lifestyle_logs,
        meal_data=meal_data,
        analysis_period_days=date_range_days,
        patterns_found=patterns
    )


async def _analyze_symptom_patterns(
    symptom_logs: List[SymptomLog],
    lifestyle_logs: List[LifestyleLog],
    meal_data: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Analyze patterns in symptom, lifestyle, and meal data"""
    patterns = []
    
    if not symptom_logs:
        return patterns
    
    # Pattern 1: Symptom frequency by time of day
    symptom_by_hour = {}
    for symptom in symptom_logs:
        hour = symptom.occurred_at.hour
        if hour not in symptom_by_hour:
            symptom_by_hour[hour] = []
        symptom_by_hour[hour].append(symptom)
    
    if symptom_by_hour:
        peak_hour = max(symptom_by_hour.keys(), key=lambda h: len(symptom_by_hour[h]))
        patterns.append({
            "type": "time_pattern",
            "description": f"Most symptoms occur around {peak_hour}:00",
            "data": {"peak_hour": peak_hour, "count": len(symptom_by_hour[peak_hour])}
        })
    
    # Pattern 2: Correlation with meal timing
    meal_symptom_correlations = []
    for symptom in symptom_logs:
        # Find meals within 4 hours before symptom
        related_meals = [
            meal for meal in meal_data
            if isinstance(meal["logged_at"], datetime) and
            0 <= (symptom.occurred_at - meal["logged_at"]).total_seconds() <= 14400  # 4 hours
        ]
        if related_meals:
            meal_symptom_correlations.append({
                "symptom": symptom.symptom_type,
                "severity": symptom.severity,
                "meals": related_meals
            })
    
    if meal_symptom_correlations:
        patterns.append({
            "type": "meal_correlation",
            "description": f"Found {len(meal_symptom_correlations)} potential meal-symptom correlations",
            "data": meal_symptom_correlations[:5]  # Limit to first 5
        })
    
    # Pattern 3: Severity trends
    if len(symptom_logs) >= 3:
        recent_severity = sum(s.severity for s in symptom_logs[:3]) / 3
        older_severity = sum(s.severity for s in symptom_logs[-3:]) / 3
        
        if recent_severity > older_severity + 1:
            patterns.append({
                "type": "severity_trend",
                "description": "Symptoms appear to be worsening",
                "data": {"recent_avg": recent_severity, "older_avg": older_severity}
            })
        elif recent_severity < older_severity - 1:
            patterns.append({
                "type": "severity_trend",
                "description": "Symptoms appear to be improving",
                "data": {"recent_avg": recent_severity, "older_avg": older_severity}
            })
    
    return patterns


async def _analyze_temporal_correlations(
    user: User,
    symptom_logs: List[SymptomLog],
    db: Session
) -> List[Dict[str, Any]]:
    """Analyze temporal correlations between meals and symptoms"""
    patterns = []
    
    if not symptom_logs:
        return patterns
    
    # Import here to avoid circular import
    from services.meal_service import find_meals_before_symptoms
    
    # Analyze each symptom for preceding meals
    symptom_meal_correlations = []
    for symptom in symptom_logs[:10]:  # Limit to recent symptoms
        # Find meals 6 hours before symptom
        related_meals = await find_meals_before_symptoms(
            user, db, symptom.occurred_at, hours_before=6
        )
        
        if related_meals:
            correlation = {
                "symptom_id": symptom.id,
                "symptom_type": symptom.symptom_type,
                "symptom_domain": symptom.symptom_domain,
                "severity": symptom.severity,
                "occurred_at": symptom.occurred_at.isoformat(),
                "related_meals": [
                    {
                        "id": meal["id"],
                        "description": meal["description"],
                        "meal_type": meal["meal_type"],
                        "time_before_symptom_hours": round(
                            (symptom.occurred_at - meal["logged_at"]).total_seconds() / 3600, 1
                        ),
                        "dietary_tags": meal["dietary_tags"],
                        "ingredients": meal["ingredients"][:5] if meal["ingredients"] else [],
                        "high_sodium": meal.get("sodium", 0) > 1000 if meal.get("sodium") else False,
                        "high_fat": meal.get("fat", 0) > 20 if meal.get("fat") else False
                    }
                    for meal in related_meals
                ]
            }
            symptom_meal_correlations.append(correlation)
    
    if symptom_meal_correlations:
        patterns.append({
            "type": "temporal_meal_correlation",
            "description": f"Found {len(symptom_meal_correlations)} symptoms with preceding meals",
            "data": symptom_meal_correlations
        })
        
        # Analyze common ingredients in correlated meals
        all_ingredients = []
        high_sodium_meals = 0
        high_fat_meals = 0
        
        for correlation in symptom_meal_correlations:
            for meal in correlation["related_meals"]:
                all_ingredients.extend(meal["ingredients"])
                if meal["high_sodium"]:
                    high_sodium_meals += 1
                if meal["high_fat"]:
                    high_fat_meals += 1
        
        ingredient_counts = {}
        for ingredient in all_ingredients:
            ingredient_counts[ingredient] = ingredient_counts.get(ingredient, 0) + 1
        
        # Find ingredients that appear frequently before symptoms
        frequent_ingredients = [
            ingredient for ingredient, count in ingredient_counts.items()
            if count >= 2  # Appears before at least 2 symptoms
        ]
        
        if frequent_ingredients:
            patterns.append({
                "type": "ingredient_trigger_pattern",
                "description": f"Ingredients frequently consumed before symptoms: {', '.join(frequent_ingredients[:5])}",
                "data": {
                    "ingredients": frequent_ingredients,
                    "ingredient_counts": ingredient_counts
                }
            })
        
        if high_sodium_meals > 2:
            patterns.append({
                "type": "sodium_correlation",
                "description": f"High sodium meals preceded {high_sodium_meals} symptoms",
                "data": {"high_sodium_meal_count": high_sodium_meals}
            })
        
        if high_fat_meals > 2:
            patterns.append({
                "type": "fat_correlation", 
                "description": f"High fat meals preceded {high_fat_meals} symptoms",
                "data": {"high_fat_meal_count": high_fat_meals}
            })
    
    return patterns


async def get_symptom_summary_stats(
    user: User,
    db: Session,
    date_range_days: int = 30
) -> Dict[str, Any]:
    """Get summary statistics for user's symptoms"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=date_range_days)
    
    symptom_logs = await get_user_symptom_logs(
        user, db, start_date=start_date, end_date=end_date, limit=1000
    )
    
    if not symptom_logs:
        return {
            "total_symptoms": 0,
            "avg_severity": 0,
            "most_common_symptom": None,
            "most_affected_domain": None,
            "trend": "no_data"
        }
    
    # Calculate statistics
    total_symptoms = len(symptom_logs)
    avg_severity = sum(s.severity for s in symptom_logs) / total_symptoms
    
    # Most common symptom type
    symptom_counts = {}
    for symptom in symptom_logs:
        symptom_counts[symptom.symptom_type] = symptom_counts.get(symptom.symptom_type, 0) + 1
    most_common_symptom = max(symptom_counts.keys(), key=lambda k: symptom_counts[k])
    
    # Most affected domain
    domain_counts = {}
    for symptom in symptom_logs:
        domain_counts[symptom.symptom_domain] = domain_counts.get(symptom.symptom_domain, 0) + 1
    most_affected_domain = max(domain_counts.keys(), key=lambda k: domain_counts[k])
    
    # Simple trend analysis
    if len(symptom_logs) >= 6:
        first_half = symptom_logs[len(symptom_logs)//2:]
        second_half = symptom_logs[:len(symptom_logs)//2]
        
        first_half_avg = sum(s.severity for s in first_half) / len(first_half)
        second_half_avg = sum(s.severity for s in second_half) / len(second_half)
        
        if second_half_avg > first_half_avg + 0.5:
            trend = "worsening"
        elif second_half_avg < first_half_avg - 0.5:
            trend = "improving"
        else:
            trend = "stable"
    else:
        trend = "insufficient_data"
    
    return {
        "total_symptoms": total_symptoms,
        "avg_severity": round(avg_severity, 1),
        "most_common_symptom": most_common_symptom,
        "most_affected_domain": most_affected_domain,
        "trend": trend,
        "symptom_counts": symptom_counts,
        "domain_counts": domain_counts
    }
