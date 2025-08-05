"""
Custom validators for enhanced user profile fields
"""
import re
import json
from datetime import datetime, time
from typing import Dict, Any, List, Optional
from pydantic import validator
from models.user import Gender, ActivityLevel, GoalType, TimeFrame


def validate_json_field(value: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Validate and sanitize JSON fields"""
    if value is None:
        return None
    
    if isinstance(value, dict):
        return value
    
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON format")
    
    raise ValueError("JSON field must be a dictionary or valid JSON string")


def validate_time_format(value: Optional[str]) -> Optional[time]:
    """Validate time format (HH:MM)"""
    if value is None:
        return None
    
    if isinstance(value, time):
        return value
    
    if isinstance(value, str):
        try:
            # Parse time in HH:MM format
            hour, minute = map(int, value.split(':'))
            if 0 <= hour <= 23 and 0 <= minute <= 59:
                return time(hour, minute)
            else:
                raise ValueError("Invalid time range")
        except (ValueError, AttributeError):
            raise ValueError("Time must be in HH:MM format")
    
    raise ValueError("Time must be a string in HH:MM format")


def validate_diet_preferences(value: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Validate diet preferences JSON structure"""
    if value is None:
        return None
    
    validated_value = validate_json_field(value)
    
    # Define allowed keys and their expected types
    allowed_keys = {
        'dietary_restrictions': list,
        'allergies': list,
        'dislikes': list,
        'cuisine_preferences': list,
        'cooking_skill': str,
        'meal_prep_time': (int, float),
        'budget_preference': str,
    }
    
    # Validate structure
    if not isinstance(validated_value, dict):
        raise ValueError("Diet preferences must be a dictionary")
    
    # Check for unexpected keys
    for key in validated_value.keys():
        if key not in allowed_keys:
            raise ValueError(f"Unexpected key in diet preferences: {key}")
    
    # Validate value types
    for key, expected_type in allowed_keys.items():
        if key in validated_value:
            if not isinstance(validated_value[key], expected_type):
                raise ValueError(f"Invalid type for {key}: expected {expected_type.__name__}")
    
    # Validate specific enum values
    if 'cooking_skill' in validated_value:
        valid_skills = ['beginner', 'intermediate', 'advanced', 'expert']
        if validated_value['cooking_skill'] not in valid_skills:
            raise ValueError(f"Invalid cooking skill: {validated_value['cooking_skill']}")
    
    if 'budget_preference' in validated_value:
        valid_budgets = ['budget', 'moderate', 'premium']
        if validated_value['budget_preference'] not in valid_budgets:
            raise ValueError(f"Invalid budget preference: {validated_value['budget_preference']}")
    
    return validated_value


def validate_snack_times(value: Optional[List[str]]) -> Optional[List[str]]:
    """Validate snack times are in correct format"""
    if value is None:
        return None
    
    if not isinstance(value, list):
        raise ValueError("Snack times must be a list")
    
    validated_times = []
    for time_str in value:
        try:
            validated_time = validate_time_format(time_str)
            validated_times.append(validated_time.strftime('%H:%M'))
        except ValueError as e:
            raise ValueError(f"Invalid snack time format: {e}")
    
    return validated_times


def validate_weight_range(value: float, field_name: str) -> float:
    """Validate weight is within reasonable range"""
    if not isinstance(value, (int, float)):
        raise ValueError(f"{field_name} must be a number")
    
    if value < 20 or value > 500:
        raise ValueError(f"{field_name} must be between 20 and 500 kg")
    
    return float(value)


def validate_age_range(value: int) -> int:
    """Validate age is within reasonable range"""
    if not isinstance(value, int):
        raise ValueError("Age must be an integer")
    
    if value < 13 or value > 120:
        raise ValueError("Age must be between 13 and 120 years")
    
    return value


def validate_height_range(value: float) -> float:
    """Validate height is within reasonable range"""
    if not isinstance(value, (int, float)):
        raise ValueError("Height must be a number")
    
    if value < 50 or value > 300:
        raise ValueError("Height must be between 50 and 300 cm")
    
    return float(value)


def validate_water_goal(value: float) -> float:
    """Validate water goal is reasonable"""
    if not isinstance(value, (int, float)):
        raise ValueError("Water goal must be a number")
    
    if value < 500 or value > 10000:
        raise ValueError("Water goal must be between 500 and 10,000 ml")
    
    return float(value)


def validate_target_date(value: Optional[str], time_frame: TimeFrame) -> Optional[datetime]:
    """Validate target date makes sense with time frame"""
    if value is None:
        return None
    
    try:
        target_date = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        raise ValueError("Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    now = datetime.now()
    
    # Target date should be in the future
    if target_date <= now:
        raise ValueError("Target date must be in the future")
    
    # Target date shouldn't be too far in the future (5 years max)
    max_date = now.replace(year=now.year + 5)
    if target_date > max_date:
        raise ValueError("Target date cannot be more than 5 years in the future")
    
    # If time_frame is not custom, validate it makes sense
    if time_frame != TimeFrame.CUSTOM:
        expected_days = {
            TimeFrame.TWO_WEEKS: 14,
            TimeFrame.ONE_MONTH: 30,
            TimeFrame.THREE_MONTHS: 90,
            TimeFrame.SIX_MONTHS: 180,
            TimeFrame.ONE_YEAR: 365,
        }
        
        days_diff = (target_date - now).days
        expected = expected_days.get(time_frame, 0)
        
        # Allow some flexibility (±20%)
        min_days = expected * 0.8
        max_days = expected * 1.2
        
        if not (min_days <= days_diff <= max_days):
            raise ValueError(f"Target date doesn't match selected time frame of {time_frame}")
    
    return target_date


def validate_weight_consistency(initial_weight: float, current_weight: float, target_weight: float, goal: GoalType) -> bool:
    """Validate that weight values are consistent with the goal"""
    
    # Basic consistency check
    if goal == GoalType.WEIGHT_LOSS:
        if target_weight >= current_weight:
            raise ValueError("For weight loss, target weight should be less than current weight")
    elif goal == GoalType.MUSCLE_GAIN:
        if target_weight <= current_weight:
            raise ValueError("For muscle gain, target weight should be greater than current weight")
    elif goal == GoalType.MAINTAIN:
        # Allow some flexibility for maintain goal
        weight_diff = abs(target_weight - current_weight)
        if weight_diff > 5:  # 5kg difference
            raise ValueError("For weight maintenance, target weight should be close to current weight")
    
    # Check that weights are reasonable relative to each other
    max_diff = abs(initial_weight - target_weight)
    if max_diff > 50:  # 50kg difference seems unrealistic
        raise ValueError("Weight difference between initial and target seems unrealistic")
    
    return True


def validate_macro_goals(calorie_goal: Optional[float], protein_goal: Optional[float], 
                        carb_goal: Optional[float], fat_goal: Optional[float]) -> bool:
    """Validate that macro goals add up to approximately the calorie goal"""
    if not all([calorie_goal, protein_goal, carb_goal, fat_goal]):
        return True  # Skip validation if any value is missing
    
    # Calculate calories from macros (protein: 4cal/g, carbs: 4cal/g, fat: 9cal/g)
    calculated_calories = (protein_goal * 4) + (carb_goal * 4) + (fat_goal * 9)
    
    # Allow 10% variance
    variance = calorie_goal * 0.1
    if abs(calculated_calories - calorie_goal) > variance:
        raise ValueError("Macro goals don't add up to the calorie goal (±10% allowed)")
    
    return True


class ProfileValidatorMixin:
    """Mixin class with validation methods for UserProfile"""
    
    @validator('age')
    def validate_age(cls, v):
        return validate_age_range(v)
    
    @validator('height')
    def validate_height(cls, v):
        return validate_height_range(v)
    
    @validator('initial_weight', 'current_weight', 'target_weight')
    def validate_weights(cls, v, field):
        return validate_weight_range(v, field.name)
    
    @validator('water_goal')
    def validate_water(cls, v):
        return validate_water_goal(v)
    
    @validator('diet_preferences')
    def validate_diet_prefs(cls, v):
        return validate_diet_preferences(v)
    
    @validator('breakfast_time', 'lunch_time', 'dinner_time')
    def validate_meal_times(cls, v):
        if v is None:
            return None
        return validate_time_format(v)
    
    @validator('snack_times')
    def validate_snack_time_list(cls, v):
        return validate_snack_times(v)
    
    @validator('target_date')
    def validate_target_date_field(cls, v, values):
        time_frame = values.get('time_frame')
        if time_frame:
            return validate_target_date(v, time_frame)
        return v