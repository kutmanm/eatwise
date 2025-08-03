from typing import Any, Dict, Optional
from datetime import datetime
from models.user import ActivityLevel, GoalType

def calculate_bmr(age: int, height: float, weight: float, is_male: bool = True) -> float:
    if is_male:
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

def calculate_tdee(bmr: float, activity_level: ActivityLevel) -> float:
    multipliers = {
        ActivityLevel.LOW: 1.2,
        ActivityLevel.MEDIUM: 1.55,
        ActivityLevel.HIGH: 1.9
    }
    return bmr * multipliers[activity_level]

def calculate_macro_targets(calories: float, goal: GoalType) -> Dict[str, float]:
    if goal == GoalType.WEIGHT_LOSS:
        protein_ratio = 0.30
        fat_ratio = 0.25
        carbs_ratio = 0.45
    elif goal == GoalType.MUSCLE_GAIN:
        protein_ratio = 0.30
        fat_ratio = 0.25
        carbs_ratio = 0.45
    else:
        protein_ratio = 0.25
        fat_ratio = 0.30
        carbs_ratio = 0.45
    
    return {
        "protein": (calories * protein_ratio) / 4,
        "fat": (calories * fat_ratio) / 9,
        "carbs": (calories * carbs_ratio) / 4
    }

def calculate_calorie_goal(weight: float, goal: GoalType, tdee: float) -> float:
    if goal == GoalType.WEIGHT_LOSS:
        return tdee - 500
    elif goal == GoalType.MUSCLE_GAIN:
        return tdee + 300
    else:
        return tdee

def format_nutrition_value(value: Optional[float]) -> str:
    if value is None:
        return "0"
    return f"{value:.1f}"