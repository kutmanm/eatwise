from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from models.user import User, UserFeedback
from models.symptom import SymptomLog
from models.meal import Meal
from datetime import datetime, timedelta
from services.symptom_service import get_symptom_summary_stats
from services.meal_service import get_daily_nutrition_summary
import json


class FeedbackType:
    DIET_EFFECTIVENESS = "diet_effectiveness"
    SYMPTOM_IMPROVEMENT = "symptom_improvement"
    PLAN_ADHERENCE = "plan_adherence"
    AI_COACHING_QUALITY = "ai_coaching_quality"
    FEATURE_USAGE = "feature_usage"


class FeedbackTrigger:
    WEEKLY_CHECK_IN = "weekly_check_in"
    SYMPTOM_IMPROVEMENT = "symptom_improvement"
    GOAL_MILESTONE = "goal_milestone"
    LOW_LOGGING_ACTIVITY = "low_logging_activity"
    HIGH_SYMPTOM_SEVERITY = "high_symptom_severity"


async def should_prompt_user_feedback(user: User, db: Session) -> Dict[str, Any]:
    """Determine if user should be prompted for feedback and what type"""
    feedback_suggestions = []
    
    # Check time since last feedback
    last_feedback = db.query(UserFeedback).filter(
        UserFeedback.user_id == user.id
    ).order_by(desc(UserFeedback.created_at)).first()
    
    days_since_feedback = 999
    if last_feedback:
        days_since_feedback = (datetime.utcnow() - last_feedback.created_at).days
    
    # Weekly check-in (prompt every 7 days)
    if days_since_feedback >= 7:
        feedback_suggestions.append({
            "type": FeedbackType.DIET_EFFECTIVENESS,
            "trigger": FeedbackTrigger.WEEKLY_CHECK_IN,
            "priority": "medium",
            "message": "How are you feeling about your diet progress this week?",
            "questions": [
                "How would you rate your energy levels this week? (1-10)",
                "Are you satisfied with your meal choices? (1-10)",
                "How easy has it been to follow your nutrition plan? (1-10)"
            ]
        })
    
    # Check symptom trends
    symptom_stats = await get_symptom_summary_stats(user, db, date_range_days=14)
    if symptom_stats["total_symptoms"] > 0:
        if symptom_stats["trend"] == "improving":
            feedback_suggestions.append({
                "type": FeedbackType.SYMPTOM_IMPROVEMENT,
                "trigger": FeedbackTrigger.SYMPTOM_IMPROVEMENT,
                "priority": "high",
                "message": "Great! Your symptoms seem to be improving. Let us know what's working!",
                "questions": [
                    "Which dietary changes have been most helpful?",
                    "How much have your symptoms improved? (1-10)",
                    "Any specific foods you've been avoiding that helped?"
                ]
            })
        elif symptom_stats["trend"] == "worsening" and symptom_stats["avg_severity"] >= 6:
            feedback_suggestions.append({
                "type": FeedbackType.SYMPTOM_IMPROVEMENT,
                "trigger": FeedbackTrigger.HIGH_SYMPTOM_SEVERITY,
                "priority": "high",
                "message": "We noticed your symptoms may be getting worse. Your feedback can help us improve your plan.",
                "questions": [
                    "What do you think might be triggering your symptoms?",
                    "Have you made any recent dietary changes?",
                    "How is your stress level and sleep quality?"
                ]
            })
    
    # Check meal logging activity
    recent_meals = db.query(Meal).filter(
        and_(
            Meal.user_id == user.id,
            Meal.logged_at >= datetime.utcnow() - timedelta(days=7)
        )
    ).count()
    
    if recent_meals < 10:  # Less than ~1.5 meals per day
        feedback_suggestions.append({
            "type": FeedbackType.PLAN_ADHERENCE,
            "trigger": FeedbackTrigger.LOW_LOGGING_ACTIVITY,
            "priority": "medium",
            "message": "We noticed you haven't been logging meals regularly. How can we help?",
            "questions": [
                "What's making it difficult to log your meals?",
                "Would you prefer a different way to track your food?",
                "Are there any features that would make logging easier?"
            ]
        })
    
    # Check if user has been using AI coaching
    if hasattr(user, 'last_ai_interaction'):
        # This would need to be tracked separately
        pass
    
    return {
        "should_prompt": len(feedback_suggestions) > 0,
        "suggestions": sorted(feedback_suggestions, key=lambda x: {"high": 3, "medium": 2, "low": 1}[x["priority"]], reverse=True),
        "next_check": datetime.utcnow() + timedelta(days=1)  # Check again tomorrow
    }


async def create_structured_feedback(
    user: User,
    feedback_type: str,
    responses: Dict[str, Any],
    trigger: str,
    db: Session
) -> UserFeedback:
    """Create a structured feedback entry with context"""
    
    # Get current context data
    context = await _get_feedback_context(user, db)
    
    feedback_data = {
        "type": feedback_type,
        "trigger": trigger,
        "responses": responses,
        "context": context,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Create feedback with structured message
    message = _format_feedback_message(feedback_type, responses)
    
    feedback = UserFeedback(
        user_id=user.id,
        message=message,
        category="structured_feedback",
        metadata=feedback_data
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    return feedback


async def _get_feedback_context(user: User, db: Session) -> Dict[str, Any]:
    """Get current user context for feedback analysis"""
    context = {
        "user_id": str(user.id),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Recent nutrition summary
    today = datetime.utcnow().date()
    try:
        nutrition_summary = await get_daily_nutrition_summary(user, today, db)
        context["nutrition"] = {
            "calories": nutrition_summary.calories,
            "protein": nutrition_summary.protein,
            "meal_count": nutrition_summary.meal_count
        }
    except:
        context["nutrition"] = {"error": "Unable to get nutrition data"}
    
    # Recent symptom summary
    try:
        symptom_summary = await get_symptom_summary_stats(user, db, 7)
        context["symptoms"] = {
            "total_symptoms": symptom_summary["total_symptoms"],
            "avg_severity": symptom_summary["avg_severity"],
            "trend": symptom_summary["trend"]
        }
    except:
        context["symptoms"] = {"error": "Unable to get symptom data"}
    
    # User profile info
    if user.profile:
        context["profile"] = {
            "goal": user.profile.goal.value if user.profile.goal else None,
            "activity_level": user.profile.activity_level.value if user.profile.activity_level else None
        }
    
    return context


def _format_feedback_message(feedback_type: str, responses: Dict[str, Any]) -> str:
    """Format structured responses into a readable message"""
    if feedback_type == FeedbackType.DIET_EFFECTIVENESS:
        energy = responses.get("energy_level", "N/A")
        satisfaction = responses.get("meal_satisfaction", "N/A")
        adherence = responses.get("plan_adherence", "N/A")
        return f"Weekly feedback: Energy level: {energy}/10, Meal satisfaction: {satisfaction}/10, Plan adherence: {adherence}/10"
    
    elif feedback_type == FeedbackType.SYMPTOM_IMPROVEMENT:
        improvement = responses.get("symptom_improvement", "N/A")
        changes = responses.get("helpful_changes", "None specified")
        return f"Symptom feedback: Improvement: {improvement}/10, Helpful changes: {changes}"
    
    elif feedback_type == FeedbackType.PLAN_ADHERENCE:
        difficulties = responses.get("logging_difficulties", "None specified")
        suggestions = responses.get("feature_suggestions", "None specified")
        return f"Adherence feedback: Difficulties: {difficulties}, Suggestions: {suggestions}"
    
    else:
        return f"Feedback ({feedback_type}): " + ", ".join([f"{k}: {v}" for k, v in responses.items()])


async def analyze_feedback_trends(user: User, db: Session, days: int = 30) -> Dict[str, Any]:
    """Analyze user feedback trends to improve AI coaching"""
    
    # Get recent structured feedback
    recent_feedback = db.query(UserFeedback).filter(
        and_(
            UserFeedback.user_id == user.id,
            UserFeedback.created_at >= datetime.utcnow() - timedelta(days=days),
            UserFeedback.category == "structured_feedback"
        )
    ).order_by(desc(UserFeedback.created_at)).all()
    
    trends = {
        "total_feedback_entries": len(recent_feedback),
        "feedback_types": {},
        "satisfaction_trends": [],
        "common_challenges": [],
        "improvement_areas": []
    }
    
    for feedback in recent_feedback:
        if feedback.metadata:
            try:
                metadata = json.loads(feedback.metadata) if isinstance(feedback.metadata, str) else feedback.metadata
                feedback_type = metadata.get("type", "unknown")
                responses = metadata.get("responses", {})
                
                # Track feedback types
                trends["feedback_types"][feedback_type] = trends["feedback_types"].get(feedback_type, 0) + 1
                
                # Extract satisfaction scores
                for key, value in responses.items():
                    if isinstance(value, (int, float)) and 1 <= value <= 10:
                        trends["satisfaction_trends"].append({
                            "date": feedback.created_at.isoformat(),
                            "metric": key,
                            "score": value,
                            "type": feedback_type
                        })
                
                # Identify challenges
                challenges = responses.get("logging_difficulties") or responses.get("challenges")
                if challenges and isinstance(challenges, str):
                    trends["common_challenges"].append(challenges)
            
            except (json.JSONDecodeError, AttributeError):
                continue
    
    # Calculate average satisfaction
    if trends["satisfaction_trends"]:
        avg_satisfaction = sum(t["score"] for t in trends["satisfaction_trends"]) / len(trends["satisfaction_trends"])
        trends["average_satisfaction"] = round(avg_satisfaction, 1)
    else:
        trends["average_satisfaction"] = None
    
    return trends
