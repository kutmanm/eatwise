from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models.user import User, UserProfile, GoalType, ActivityLevel, Gender
from schemas.user import UserProfileCreate
from datetime import datetime
from pydantic import BaseModel


class StreamlinedOnboardingData(BaseModel):
    # Essential health goals
    primary_goal: str  # weight_loss, muscle_gain, maintain, general_health
    target_timeline: str  # 1_month, 3_months, 6_months, 1_year
    
    # Basic info (minimal)
    age: int
    gender: str
    
    # Dietary preferences (simplified)
    dietary_restrictions: List[str] = []  # vegan, vegetarian, gluten_free, dairy_free, etc.
    food_allergies: List[str] = []
    
    # Symptom focus (key addition)
    primary_symptom_concerns: List[str] = []  # digestion, skin, energy, mood, sleep
    specific_symptoms: List[str] = []  # bloating, fatigue, acne, etc.
    
    # Optional (can be set later)
    current_weight: Optional[float] = None
    height: Optional[float] = None
    activity_level: str = "moderately_active"


async def process_streamlined_onboarding(
    user: User,
    onboarding_data: StreamlinedOnboardingData,
    db: Session
) -> Dict[str, Any]:
    """Process streamlined onboarding with focus on health goals and symptoms"""
    
    try:
        # Create simplified user profile
        profile_data = _create_simplified_profile(onboarding_data)
        
        # Create the profile
        profile = UserProfile(
            user_id=user.id,
            **profile_data
        )
        
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Generate initial recommendations
        recommendations = _generate_initial_recommendations(onboarding_data)
        
        # Create next steps
        next_steps = _create_next_steps(onboarding_data)
        
        return {
            "success": True,
            "profile_created": True,
            "onboarding_complete": True,
            "user_profile": {
                "goal": profile_data["goal"].value,
                "dietary_focus": onboarding_data.dietary_restrictions,
                "symptom_focus": onboarding_data.primary_symptom_concerns
            },
            "recommendations": recommendations,
            "next_steps": next_steps,
            "ready_for_plan_generation": True
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to process onboarding: {str(e)}"
        }


def _create_simplified_profile(data: StreamlinedOnboardingData) -> Dict[str, Any]:
    """Create a simplified user profile from onboarding data"""
    
    # Map string goals to enum
    goal_mapping = {
        "weight_loss": GoalType.WEIGHT_LOSS,
        "muscle_gain": GoalType.MUSCLE_GAIN,
        "maintain": GoalType.MAINTAIN,
        "general_health": GoalType.MAINTAIN  # Default fallback
    }
    
    activity_mapping = {
        "sedentary": ActivityLevel.SEDENTARY,
        "lightly_active": ActivityLevel.LIGHTLY_ACTIVE,
        "moderately_active": ActivityLevel.MODERATELY_ACTIVE,
        "very_active": ActivityLevel.VERY_ACTIVE,
        "extremely_active": ActivityLevel.EXTREMELY_ACTIVE
    }
    
    gender_mapping = {
        "male": Gender.MALE,
        "female": Gender.FEMALE,
        "other": Gender.OTHER,
        "prefer_not_to_say": Gender.PREFER_NOT_TO_SAY
    }
    
    # Set defaults for required fields
    profile_data = {
        "age": data.age,
        "gender": gender_mapping.get(data.gender, Gender.PREFER_NOT_TO_SAY),
        "height": data.height or 170.0,  # Default height
        "initial_weight": data.current_weight or 70.0,  # Default weight
        "current_weight": data.current_weight or 70.0,
        "target_weight": data.current_weight or 70.0,  # Can be updated later
        "activity_level": activity_mapping.get(data.activity_level, ActivityLevel.MODERATELY_ACTIVE),
        "goal": goal_mapping.get(data.primary_goal, GoalType.MAINTAIN),
        "time_frame": _map_timeline_to_timeframe(data.target_timeline),
        "water_goal": 2000.0,  # Default 2L
        "diet_preferences": {
            "dietary_restrictions": data.dietary_restrictions,
            "allergies": data.food_allergies,
            "symptom_focus": data.primary_symptom_concerns,
            "specific_symptoms": data.specific_symptoms,
            "onboarding_version": "streamlined_v1"
        }
    }
    
    return profile_data


def _map_timeline_to_timeframe(timeline: str):
    """Map timeline string to TimeFrame enum"""
    from models.user import TimeFrame
    
    mapping = {
        "1_month": TimeFrame.MONTH_1,
        "3_months": TimeFrame.MONTHS_3,
        "6_months": TimeFrame.MONTHS_6,
        "1_year": TimeFrame.YEAR_1
    }
    
    return mapping.get(timeline, TimeFrame.MONTHS_3)


def _generate_initial_recommendations(data: StreamlinedOnboardingData) -> List[str]:
    """Generate initial recommendations based on onboarding data"""
    recommendations = []
    
    # Goal-based recommendations
    if data.primary_goal == "weight_loss":
        recommendations.append("Focus on balanced meals with lean proteins and vegetables")
        recommendations.append("Track portion sizes and meal timing")
    elif data.primary_goal == "muscle_gain":
        recommendations.append("Prioritize protein intake with each meal")
        recommendations.append("Include post-workout nutrition")
    else:
        recommendations.append("Maintain balanced nutrition with variety")
    
    # Symptom-based recommendations
    if "digestion" in data.primary_symptom_concerns:
        recommendations.append("Start tracking meal-symptom correlations")
        recommendations.append("Consider keeping a food journal for trigger identification")
    
    if "energy" in data.primary_symptom_concerns or "fatigue" in data.specific_symptoms:
        recommendations.append("Monitor blood sugar stability with balanced meals")
        recommendations.append("Track meal timing and energy levels")
    
    if "skin" in data.primary_symptom_concerns:
        recommendations.append("Pay attention to dairy and high-glycemic foods")
        recommendations.append("Monitor inflammation triggers")
    
    # Dietary restriction recommendations
    if "vegan" in data.dietary_restrictions:
        recommendations.append("Ensure adequate B12, iron, and protein intake")
    
    if "gluten_free" in data.dietary_restrictions:
        recommendations.append("Focus on whole, unprocessed foods")
    
    return recommendations[:5]  # Limit to top 5


def _create_next_steps(data: StreamlinedOnboardingData) -> List[Dict[str, Any]]:
    """Create actionable next steps for the user"""
    next_steps = [
        {
            "step": 1,
            "title": "Generate Your First Meal Plan",
            "description": "Create a personalized 7-day meal plan based on your goals and symptoms",
            "action": "generate_meal_plan",
            "estimated_time": "2 minutes"
        },
        {
            "step": 2,
            "title": "Log Your First Meal",
            "description": "Start tracking by logging your next meal",
            "action": "log_meal",
            "estimated_time": "1 minute"
        }
    ]
    
    # Add symptom-specific steps
    if data.primary_symptom_concerns:
        next_steps.append({
            "step": 3,
            "title": "Set Up Quick Symptom Logging",
            "description": "Enable 1-tap symptom tracking linked to your meals",
            "action": "setup_symptom_tracking",
            "estimated_time": "30 seconds"
        })
    
    # Add optional steps
    if not data.current_weight or not data.height:
        next_steps.append({
            "step": 4,
            "title": "Complete Your Profile (Optional)",
            "description": "Add weight and height for more accurate recommendations",
            "action": "complete_profile",
            "estimated_time": "1 minute",
            "optional": True
        })
    
    return next_steps


def get_onboarding_options() -> Dict[str, Any]:
    """Get all available onboarding options"""
    return {
        "primary_goals": [
            {"value": "weight_loss", "label": "Lose Weight", "description": "Reduce body weight healthily"},
            {"value": "muscle_gain", "label": "Build Muscle", "description": "Increase muscle mass and strength"},
            {"value": "maintain", "label": "Maintain Weight", "description": "Keep current weight stable"},
            {"value": "general_health", "label": "Improve Health", "description": "Focus on overall wellness"}
        ],
        "timelines": [
            {"value": "1_month", "label": "1 Month", "description": "Quick results"},
            {"value": "3_months", "label": "3 Months", "description": "Sustainable progress"},
            {"value": "6_months", "label": "6 Months", "description": "Long-term changes"},
            {"value": "1_year", "label": "1 Year", "description": "Life transformation"}
        ],
        "dietary_restrictions": [
            {"value": "vegan", "label": "Vegan"},
            {"value": "vegetarian", "label": "Vegetarian"},
            {"value": "gluten_free", "label": "Gluten-Free"},
            {"value": "dairy_free", "label": "Dairy-Free"},
            {"value": "low_carb", "label": "Low-Carb"},
            {"value": "keto", "label": "Ketogenic"},
            {"value": "paleo", "label": "Paleo"},
            {"value": "low_fodmap", "label": "Low-FODMAP"},
            {"value": "halal", "label": "Halal"},
            {"value": "kosher", "label": "Kosher"}
        ],
        "symptom_concerns": [
            {"value": "digestion", "label": "Digestive Issues", "description": "Bloating, stomach pain, irregular bowel movements"},
            {"value": "energy", "label": "Energy & Fatigue", "description": "Low energy, fatigue, brain fog"},
            {"value": "skin", "label": "Skin Health", "description": "Acne, eczema, inflammation"},
            {"value": "mood", "label": "Mood & Mental Health", "description": "Anxiety, mood swings, irritability"},
            {"value": "sleep", "label": "Sleep Quality", "description": "Insomnia, poor sleep quality"},
            {"value": "physical", "label": "Physical Pain", "description": "Headaches, joint pain, muscle pain"}
        ],
        "common_symptoms": [
            {"value": "bloating", "label": "Bloating", "domain": "digestion"},
            {"value": "fatigue", "label": "Fatigue", "domain": "energy"},
            {"value": "stomach_pain", "label": "Stomach Pain", "domain": "digestion"},
            {"value": "acne", "label": "Acne", "domain": "skin"},
            {"value": "brain_fog", "label": "Brain Fog", "domain": "energy"},
            {"value": "headache", "label": "Headaches", "domain": "physical"},
            {"value": "anxiety", "label": "Anxiety", "domain": "mood"},
            {"value": "insomnia", "label": "Insomnia", "domain": "sleep"}
        ]
    }
