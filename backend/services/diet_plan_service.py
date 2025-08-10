from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models.user import User
from models.meal import Meal
from models.diet_plan import DietPlan, WeeklySummary
from models.symptom import SymptomLog
from services.ai_service import client
from services.symptom_service import get_symptom_summary_stats
from services.meal_service import analyze_meal_nutrient_patterns
from services.prompts import get_plan_system_prompt
from datetime import datetime, timedelta, date
import json


class DietPlan:
    def __init__(self, user_id: str, plan_data: Dict[str, Any]):
        self.user_id = user_id
        self.plan_data = plan_data
        self.created_at = datetime.utcnow()
        self.week_start = plan_data.get('week_start')
        
    def to_dict(self):
        return {
            "user_id": self.user_id,
            "plan_data": self.plan_data,
            "created_at": self.created_at.isoformat(),
            "week_start": self.week_start
        }


async def generate_7_day_diet_plan(
    user: User,
    db: Session,
    symptoms_focus: Optional[List[str]] = None,
    dietary_preferences: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Generate a personalized 7-day meal plan based on user data and symptoms"""
    
    # Get user context data
    context = await _gather_user_context(user, db)
    
    # Prepare AI prompt with user data
    prompt_data = _prepare_plan_generation_prompt(
        user, context, symptoms_focus, dietary_preferences
    )
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            temperature=0.7,
            max_tokens=2000,
            messages=[
                {
                    "role": "system",
                    "content": get_plan_system_prompt(symptoms_focus)
                },
                {
                    "role": "user",
                    "content": prompt_data
                }
            ]
        )
        
        # Parse AI response
        plan_content = response.choices[0].message.content
        plan_json = _extract_json_from_response(plan_content)
        
        # Structure the plan
        week_start = _get_next_monday()
        structured_plan = _structure_diet_plan(plan_json, week_start, user)

        # Persist (upsert) plan
        existing = db.query(DietPlan).filter(
            DietPlan.user_id == user.id,
            DietPlan.week_start == week_start
        ).first()
        if existing:
            existing.plan = structured_plan
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
        else:
            db_plan = DietPlan(
                user_id=user.id,
                week_start=week_start,
                plan=structured_plan,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(db_plan)
            db.commit()
            db.refresh(db_plan)
        
        return {
            "success": True,
            "plan": structured_plan,
            "week_start": week_start.isoformat(),
            "generated_at": datetime.utcnow().isoformat(),
            "user_id": str(user.id)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to generate plan: {str(e)}",
            "fallback_plan": _generate_fallback_plan(user)
        }


async def _gather_user_context(user: User, db: Session) -> Dict[str, Any]:
    """Gather comprehensive user context for plan generation"""
    context = {
        "user_profile": {},
        "nutrition_patterns": {},
        "symptom_summary": {},
        "recent_meals": [],
        "_db": db
    }
    
    # User profile data
    if user.profile:
        context["user_profile"] = {
            "goal": user.profile.goal.value if user.profile.goal else "maintain",
            "activity_level": user.profile.activity_level.value if user.profile.activity_level else "moderately_active",
            "diet_preferences": user.profile.diet_preferences or {},
            "calorie_goal": user.profile.calorie_goal,
            "protein_goal": user.profile.protein_goal,
            "age": user.profile.age,
            "gender": user.profile.gender.value if user.profile.gender else "not_specified"
        }
    
    # Nutrition patterns from recent meals
    try:
        nutrition_analysis = await analyze_meal_nutrient_patterns(user, db, days=14)
        context["nutrition_patterns"] = nutrition_analysis
    except:
        context["nutrition_patterns"] = {"error": "Could not analyze recent meals"}
    
    # Symptom summary
    try:
        symptom_stats = await get_symptom_summary_stats(user, db, date_range_days=14)
        context["symptom_summary"] = symptom_stats
    except:
        context["symptom_summary"] = {"error": "Could not analyze symptoms"}
    
    # Recent meals for pattern analysis
    recent_meals = db.query(Meal).filter(
        Meal.user_id == user.id
    ).order_by(Meal.logged_at.desc()).limit(10).all()
    
    context["recent_meals"] = [
        {
            "description": meal.description,
            "meal_type": meal.meal_type,
            "dietary_tags": meal.dietary_tags or [],
            "logged_at": meal.logged_at.isoformat()
        }
        for meal in recent_meals
    ]
    
    return context


def _prepare_plan_generation_prompt(
    user: User,
    context: Dict[str, Any],
    symptoms_focus: Optional[List[str]],
    dietary_preferences: Optional[Dict[str, Any]]
) -> str:
    """Prepare detailed prompt for AI plan generation"""
    
    profile = context.get("user_profile", {})
    symptom_summary = context.get("symptom_summary", {})
    nutrition_patterns = context.get("nutrition_patterns", {})
    
    # Fetch last plan feedback if available to influence next plan
    last_feedback = _get_latest_feedback_for_user(user, db=context.get("_db")) if context else None

    prompt = f"""
Create a 7-day meal plan for a user with the following profile:

USER PROFILE:
- Goal: {profile.get('goal', 'maintain')}
- Activity Level: {profile.get('activity_level', 'moderate')}
- Age: {profile.get('age', 'not specified')}
- Gender: {profile.get('gender', 'not specified')}
- Calorie Goal: {profile.get('calorie_goal', 'auto-calculate')} per day
- Protein Goal: {profile.get('protein_goal', 'auto-calculate')}g per day

DIETARY PREFERENCES:
{json.dumps(dietary_preferences or profile.get('diet_preferences', {}), indent=2)}

SYMPTOM FOCUS:
{symptoms_focus or ['general health']}

RECENT SYMPTOM PATTERNS:
- Total symptoms last 14 days: {symptom_summary.get('total_symptoms', 0)}
- Most common symptom: {symptom_summary.get('most_common_symptom', 'none')}
- Most affected domain: {symptom_summary.get('most_affected_domain', 'none')}
- Trend: {symptom_summary.get('trend', 'stable')}

NUTRITION PATTERNS:
- Recent meal count: {nutrition_patterns.get('total_meals', 0)}
- Common dietary patterns: {nutrition_patterns.get('dietary_patterns', {})}

 LAST USER FEEDBACK (if any):
 {json.dumps(last_feedback or {}, indent=2)}

 REQUIREMENTS:
1. Create exactly 7 days of meals (Monday-Sunday)
2. Each day should have: breakfast, lunch, dinner, and 1-2 optional snacks
3. Consider symptom triggers and dietary preferences
4. Provide approximate nutrition per meal (calories, protein, carbs, fat)
5. Include brief reasoning for symptom management
6. Make meals practical and realistic
7. Vary meals across the week but keep prep simple

Return ONLY valid JSON in this format:
{{
  "week_plan": {{
    "monday": {{
      "breakfast": {{"name": "...", "description": "...", "calories": 400, "protein": 20, "carbs": 45, "fat": 15, "reasoning": "..."}},
      "lunch": {{"name": "...", "description": "...", "calories": 500, "protein": 25, "carbs": 50, "fat": 20, "reasoning": "..."}},
      "dinner": {{"name": "...", "description": "...", "calories": 600, "protein": 30, "carbs": 60, "fat": 25, "reasoning": "..."}},
      "snacks": [{{"name": "...", "description": "...", "calories": 150, "protein": 5, "carbs": 20, "fat": 6}}]
    }},
    "tuesday": {{ ... }},
    ... (continue for all 7 days)
  }},
  "plan_summary": {{
    "total_daily_calories": 1650,
    "daily_protein": 80,
    "key_focus_areas": ["reduce inflammation", "support digestion"],
    "meal_prep_tips": ["...", "..."],
    "shopping_list_highlights": ["...", "..."]
  }}
}}
"""
    return prompt


def _get_latest_feedback_for_user(user: User, db: Session) -> Optional[Dict[str, Any]]:
    try:
        from models.diet_plan import PlanFeedback
        row = db.query(PlanFeedback).filter(PlanFeedback.user_id == user.id).order_by(PlanFeedback.week_start.desc()).first()
        return row.feedback if row else None
    except Exception:
        return None


# prompt helpers moved to services/prompts


def _extract_json_from_response(response_text: str) -> Dict[str, Any]:
    """Extract JSON from AI response"""
    try:
        # Find JSON block
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        else:
            raise ValueError("No JSON found in response")
    except Exception as e:
        # Return a basic structure if parsing fails
        return {
            "week_plan": _generate_basic_week_plan(),
            "plan_summary": {
                "total_daily_calories": 1600,
                "daily_protein": 80,
                "key_focus_areas": ["balanced nutrition"],
                "meal_prep_tips": ["Plan meals in advance"],
                "shopping_list_highlights": ["Fresh vegetables", "Lean proteins"]
            }
        }


def _structure_diet_plan(plan_json: Dict[str, Any], week_start: date, user: User) -> Dict[str, Any]:
    """Structure the diet plan with proper dates and formatting"""
    
    week_plan = plan_json.get("week_plan", {})
    plan_summary = plan_json.get("plan_summary", {})
    
    # Convert day names to actual dates
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    structured_days = {}
    
    for i, day_name in enumerate(days):
        current_date = week_start + timedelta(days=i)
        day_data = week_plan.get(day_name, {})
        
        structured_days[current_date.isoformat()] = {
            "date": current_date.isoformat(),
            "day_name": day_name.title(),
            "meals": day_data,
            "daily_totals": _calculate_daily_totals(day_data)
        }
    
    return {
        "week_start": week_start.isoformat(),
        "week_end": (week_start + timedelta(days=6)).isoformat(),
        "days": structured_days,
        "summary": plan_summary,
        "user_id": str(user.id),
        "plan_type": "ai_generated",
        "version": "1.0"
    }


def _calculate_daily_totals(day_meals: Dict[str, Any]) -> Dict[str, float]:
    """Calculate daily nutrition totals from meals"""
    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    
    for meal_type, meal_data in day_meals.items():
        if isinstance(meal_data, dict):
            totals["calories"] += meal_data.get("calories", 0)
            totals["protein"] += meal_data.get("protein", 0)
            totals["carbs"] += meal_data.get("carbs", 0)
            totals["fat"] += meal_data.get("fat", 0)
        elif isinstance(meal_data, list):  # snacks array
            for snack in meal_data:
                totals["calories"] += snack.get("calories", 0)
                totals["protein"] += snack.get("protein", 0)
                totals["carbs"] += snack.get("carbs", 0)
                totals["fat"] += snack.get("fat", 0)
    
    return totals


def _get_next_monday() -> date:
    """Get the date of the next Monday"""
    today = date.today()
    days_ahead = 7 - today.weekday()  # Monday is 0
    if days_ahead <= 0:  # Target day already happened this week
        days_ahead += 7
    return today + timedelta(days_ahead)


def _generate_basic_week_plan() -> Dict[str, Any]:
    """Generate a basic fallback week plan"""
    basic_day = {
        "breakfast": {
            "name": "Balanced Breakfast",
            "description": "Oatmeal with berries and nuts",
            "calories": 350,
            "protein": 15,
            "carbs": 45,
            "fat": 12,
            "reasoning": "Balanced macros for sustained energy"
        },
        "lunch": {
            "name": "Healthy Lunch",
            "description": "Grilled chicken salad with mixed vegetables",
            "calories": 450,
            "protein": 35,
            "carbs": 25,
            "fat": 20,
            "reasoning": "High protein for satiety"
        },
        "dinner": {
            "name": "Nutritious Dinner",
            "description": "Baked salmon with quinoa and steamed broccoli",
            "calories": 550,
            "protein": 40,
            "carbs": 45,
            "fat": 22,
            "reasoning": "Omega-3s and fiber for health"
        },
        "snacks": [{
            "name": "Healthy Snack",
            "description": "Greek yogurt with berries",
            "calories": 120,
            "protein": 10,
            "carbs": 15,
            "fat": 3
        }]
    }
    
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    return {day: basic_day for day in days}


def _generate_fallback_plan(user: User) -> Dict[str, Any]:
    """Generate a simple fallback plan when AI generation fails"""
    week_start = _get_next_monday()
    basic_plan = {
        "week_plan": _generate_basic_week_plan(),
        "plan_summary": {
            "total_daily_calories": 1470,
            "daily_protein": 100,
            "key_focus_areas": ["balanced nutrition", "consistent meals"],
            "meal_prep_tips": ["Prepare proteins in advance", "Keep healthy snacks available"],
            "shopping_list_highlights": ["Lean proteins", "Whole grains", "Fresh vegetables", "Fruits"]
        }
    }
    
    return _structure_diet_plan(basic_plan, week_start, user)


async def update_plan_after_feedback(
    user: User,
    current_plan: Dict[str, Any],
    feedback: Dict[str, Any],
    db: Session
) -> Dict[str, Any]:
    """Update the diet plan based on weekly feedback"""
    
    # Get updated context
    context = await _gather_user_context(user, db)
    
    # Prepare update prompt
    update_prompt = f"""
Based on the following feedback, update the current meal plan:

CURRENT PLAN SUMMARY:
{json.dumps(current_plan.get('summary', {}), indent=2)}

USER FEEDBACK:
{json.dumps(feedback, indent=2)}

UPDATED CONTEXT:
{json.dumps(context.get('symptom_summary', {}), indent=2)}

Please provide specific adjustments to make for next week's plan:
1. Which meals to modify or replace
2. Ingredients/foods to avoid or include more
3. Portion adjustments
4. New focus areas based on symptom changes

Return JSON with specific recommendations.
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            temperature=0.6,
            max_tokens=800,
            messages=[
                {
                    "role": "system",
                    "content": "You are a nutrition expert updating meal plans based on user feedback and symptom changes."
                },
                {
                    "role": "user",
                    "content": update_prompt
                }
            ]
        )
        
        recommendations = response.choices[0].message.content
        return {
            "success": True,
            "recommendations": recommendations,
            "should_regenerate": True
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "should_regenerate": False
        }


# Export generation is intentionally omitted from backend per product requirement
