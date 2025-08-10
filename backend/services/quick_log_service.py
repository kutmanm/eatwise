from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.user import User
from models.meal import Meal
from models.symptom import SymptomLog
from services.symptom_service import create_symptom_log
from schemas.symptom import SymptomLogCreate
from datetime import datetime, timedelta


async def quick_log_symptom(
    user: User,
    symptom_type: str,
    severity: int,
    db: Session,
    link_to_latest_meal: bool = True,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """Quick symptom logging with automatic meal linking"""
    
    try:
        # Get the latest meal if linking is requested
        related_meal = None
        if link_to_latest_meal:
            # Find the most recent meal within the last 6 hours
            six_hours_ago = datetime.utcnow() - timedelta(hours=6)
            related_meal = db.query(Meal).filter(
                Meal.user_id == user.id,
                Meal.logged_at >= six_hours_ago
            ).order_by(desc(Meal.logged_at)).first()
        
        # Determine symptom domain based on symptom type
        symptom_domain = _get_symptom_domain(symptom_type)
        
        # Create symptom log
        # Clamp severity into 1..10
        try:
            severity = int(severity)
        except Exception:
            severity = 1
        severity = max(1, min(10, severity))

        symptom_data = SymptomLogCreate(
            symptom_type=symptom_type,
            symptom_domain=symptom_domain,
            severity=severity,
            occurred_at=datetime.utcnow(),
            notes=notes or f"Quick-logged symptom{' - linked to recent meal' if related_meal else ''}"
        )
        
        # Add meal trigger if linked
        if related_meal:
            triggers = [f"Recent meal: {related_meal.description}"]
            if related_meal.dietary_tags:
                triggers.extend(related_meal.dietary_tags)
            symptom_data.triggers = triggers
        
        symptom_log = await create_symptom_log(user, symptom_data, db)
        
        return {
            "success": True,
            "symptom_log": {
                "id": symptom_log.id,
                "symptom_type": symptom_log.symptom_type,
                "severity": symptom_log.severity,
                "occurred_at": symptom_log.occurred_at.isoformat(),
                "linked_meal": {
                    "id": related_meal.id,
                    "description": related_meal.description,
                    "logged_at": related_meal.logged_at.isoformat(),
                    "time_difference_hours": round(
                        (symptom_log.occurred_at - related_meal.logged_at).total_seconds() / 3600, 1
                    )
                } if related_meal else None
            },
            "quick_insights": _generate_quick_insights(symptom_type, severity, related_meal)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to log symptom: {str(e)}"
        }


def _get_symptom_domain(symptom_type: str) -> str:
    """Map symptom type to domain"""
    domain_mapping = {
        # Digestive
        "bloating": "digestion",
        "stomach_pain": "digestion", 
        "nausea": "digestion",
        "heartburn": "digestion",
        "diarrhea": "digestion",
        "constipation": "digestion",
        "gas": "digestion",
        "indigestion": "digestion",
        
        # Skin
        "acne": "skin",
        "eczema": "skin",
        "rash": "skin",
        "itching": "skin",
        "dryness": "skin",
        "inflammation": "skin",
        
        # Energy/Fatigue
        "fatigue": "fatigue",
        "low_energy": "fatigue",
        "brain_fog": "fatigue",
        "drowsiness": "fatigue",
        "restlessness": "fatigue",
        
        # Mood
        "anxiety": "mood",
        "irritability": "mood",
        "mood_swings": "mood",
        "depression": "mood",
        
        # Physical
        "headache": "physical",
        "joint_pain": "physical",
        "muscle_pain": "physical",
        "inflammation_general": "physical",
        
        # Sleep
        "insomnia": "sleep",
        "poor_sleep_quality": "sleep",
        "sleep_disturbances": "sleep",
    }
    
    return domain_mapping.get(symptom_type, "other")


def _generate_quick_insights(
    symptom_type: str,
    severity: int,
    related_meal: Optional[Meal]
) -> List[str]:
    """Generate quick insights for the logged symptom"""
    insights = []
    
    # Severity-based insights
    if severity >= 7:
        insights.append("High severity symptom - consider tracking potential triggers more closely")
    elif severity >= 4:
        insights.append("Moderate symptom - keep monitoring patterns")
    else:
        insights.append("Mild symptom - good to track for patterns")
    
    # Symptom-specific insights
    domain = _get_symptom_domain(symptom_type)
    
    if domain == "digestion" and related_meal:
        if related_meal.dietary_tags:
            high_trigger_tags = ["dairy", "gluten", "spicy", "high-fat"]
            meal_triggers = [tag for tag in related_meal.dietary_tags if tag in high_trigger_tags]
            if meal_triggers:
                insights.append(f"Recent meal contained potential triggers: {', '.join(meal_triggers)}")
        
        insights.append("Digestive symptoms often appear 2-6 hours after eating")
    
    elif domain == "skin":
        insights.append("Skin symptoms may be delayed - consider foods from past 24-48 hours")
    
    elif domain == "fatigue":
        if related_meal:
            insights.append("Energy dips can be related to blood sugar changes after meals")
    
    elif domain == "mood":
        insights.append("Mood changes can be influenced by blood sugar and nutrient intake")
    
    # Meal timing insights
    if related_meal:
        time_diff = (datetime.utcnow() - related_meal.logged_at).total_seconds() / 3600
        if time_diff < 2:
            insights.append("Symptom occurred soon after eating - may be a direct trigger")
        elif time_diff < 4:
            insights.append("Symptom timing suggests possible food correlation")
        else:
            insights.append("Symptom may be related to earlier meal or other factors")
    else:
        insights.append("No recent meals found - consider other triggers like stress, sleep, or environment")
    
    return insights[:3]  # Return top 3 insights


async def get_quick_log_suggestions(user: User, db: Session) -> Dict[str, Any]:
    """Get suggestions for quick symptom logging based on recent patterns"""
    
    # Get recent symptoms to suggest common ones
    recent_symptoms = db.query(SymptomLog).filter(
        SymptomLog.user_id == user.id,
        SymptomLog.occurred_at >= datetime.utcnow() - timedelta(days=7)
    ).all()
    
    # Get latest meal for quick linking
    latest_meal = db.query(Meal).filter(
        Meal.user_id == user.id
    ).order_by(desc(Meal.logged_at)).first()
    
    # Count symptom frequency
    symptom_counts = {}
    for symptom in recent_symptoms:
        symptom_counts[symptom.symptom_type] = symptom_counts.get(symptom.symptom_type, 0) + 1
    
    # Sort by frequency
    common_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "latest_meal": {
            "id": latest_meal.id,
            "description": latest_meal.description,
            "logged_at": latest_meal.logged_at.isoformat(),
            "hours_ago": round((datetime.utcnow() - latest_meal.logged_at).total_seconds() / 3600, 1)
        } if latest_meal else None,
        "common_symptoms": [
            {
                "type": symptom_type,
                "label": symptom_type.replace('_', ' ').title(),
                "frequency": count
            }
            for symptom_type, count in common_symptoms
        ],
        "quick_options": [
            {"type": "bloating", "label": "Bloating", "domain": "digestion"},
            {"type": "fatigue", "label": "Fatigue", "domain": "fatigue"},
            {"type": "headache", "label": "Headache", "domain": "physical"},
            {"type": "nausea", "label": "Nausea", "domain": "digestion"},
            {"type": "stomach_pain", "label": "Stomach Pain", "domain": "digestion"}
        ]
    }
