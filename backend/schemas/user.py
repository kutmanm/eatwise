from pydantic import BaseModel, EmailStr, Field, validator, root_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, time
from uuid import UUID
from models.user import UserRole, ActivityLevel, GoalType, Gender, TimeFrame
from utils.validators import (
    ProfileValidatorMixin, validate_weight_consistency, validate_macro_goals,
    validate_json_field, validate_time_format
)

class UserProfileBase(BaseModel):
    # Basic demographics
    age: int = Field(ge=1, le=120)
    gender: Gender
    height: float = Field(ge=50, le=300)  # in cm
    
    # Weight information
    initial_weight: float = Field(ge=20, le=500)  # in kg - starting weight
    current_weight: float = Field(ge=20, le=500)  # in kg - current weight
    target_weight: float = Field(ge=20, le=500)   # in kg - goal weight
    
    # Goals and preferences
    activity_level: ActivityLevel
    goal: GoalType
    time_frame: TimeFrame
    target_date: Optional[datetime] = Field(None)  # specific target date if time_frame is CUSTOM
    
    # Nutrition goals
    water_goal: float = Field(default=2000.0, ge=0)  # in ml per day
    calorie_goal: Optional[float] = Field(None, ge=0)  # calculated daily calorie target
    protein_goal: Optional[float] = Field(None, ge=0)  # in grams per day
    carb_goal: Optional[float] = Field(None, ge=0)     # in grams per day
    fat_goal: Optional[float] = Field(None, ge=0)      # in grams per day
    
    # Meal preferences
    diet_preferences: Optional[Dict[str, Any]] = None  # JSON field for flexible diet preferences
    
    # Meal timing preferences
    breakfast_time: Optional[Union[time, str]] = Field(default=time(8, 0))
    lunch_time: Optional[Union[time, str]] = Field(default=time(12, 30))
    dinner_time: Optional[Union[time, str]] = Field(default=time(19, 0))
    snack_times: Optional[List[str]] = None  # Array of times for snacks
    
    @validator('breakfast_time', 'lunch_time', 'dinner_time', pre=True)
    def parse_time_fields(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                # Parse HH:MM format
                hour, minute = map(int, v.split(':'))
                return time(hour, minute)
            except (ValueError, AttributeError):
                raise ValueError(f'Time must be in HH:MM format, got: {v}')
        return v
    
    @validator('target_date', pre=True, always=True)
    def parse_target_date(cls, v):
        # Handle None, empty string, or already parsed datetime
        if v is None or v == '' or isinstance(v, datetime):
            return v if isinstance(v, datetime) else None
            
        if isinstance(v, str):
            v = v.strip()
            if not v:  # Empty string after strip
                return None
                
            # Try to parse YYYY-MM-DD format (from frontend)
            try:
                return datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                # If parsing fails, log the error and return None instead of raising
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f'Failed to parse target_date: {v}, setting to None')
                return None
        
        return None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    # Basic demographics
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[Gender] = None
    height: Optional[float] = Field(None, ge=50, le=300)
    
    # Weight information
    initial_weight: Optional[float] = Field(None, ge=20, le=500)
    current_weight: Optional[float] = Field(None, ge=20, le=500)
    target_weight: Optional[float] = Field(None, ge=20, le=500)
    
    # Goals and preferences
    activity_level: Optional[ActivityLevel] = None
    goal: Optional[GoalType] = None
    time_frame: Optional[TimeFrame] = None
    target_date: Optional[datetime] = None
    
    # Nutrition goals
    water_goal: Optional[float] = Field(None, ge=0)
    calorie_goal: Optional[float] = Field(None, ge=0)
    protein_goal: Optional[float] = Field(None, ge=0)
    carb_goal: Optional[float] = Field(None, ge=0)
    fat_goal: Optional[float] = Field(None, ge=0)
    
    # Meal preferences
    diet_preferences: Optional[Dict[str, Any]] = None
    
    # Meal timing preferences
    breakfast_time: Optional[time] = None
    lunch_time: Optional[time] = None
    dinner_time: Optional[time] = None
    snack_times: Optional[List[str]] = None

class UserProfile(UserProfileBase):
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None

class User(UserBase):
    id: UUID
    role: UserRole
    created_at: datetime
    profile: Optional[UserProfile] = None
    
    class Config:
        from_attributes = True

class SubscriptionBase(BaseModel):
    plan: str

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: int
    user_id: UUID
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "trialing"  # Stripe status: trialing, active, canceled, etc.
    
    class Config:
        from_attributes = True

# WeightLog schemas
class WeightLogBase(BaseModel):
    weight: float = Field(ge=20, le=500)  # in kg
    notes: Optional[str] = None

class WeightLogCreate(WeightLogBase):
    pass

class WeightLogUpdate(BaseModel):
    weight: Optional[float] = Field(None, ge=20, le=500)
    notes: Optional[str] = None

class WeightLog(WeightLogBase):
    id: int
    user_id: UUID
    logged_at: datetime
    
    class Config:
        from_attributes = True

# UserFeedback schemas
class UserFeedbackBase(BaseModel):
    message: str = Field(min_length=1, max_length=1000)

    @validator('message')
    def validate_message_content(cls, v):
        # Remove excessive whitespace and validate content
        cleaned = ' '.join(v.split())
        if len(cleaned) < 1:
            raise ValueError('Message cannot be empty')
        return cleaned

class UserFeedbackCreate(UserFeedbackBase):
    pass

class UserFeedback(UserFeedbackBase):
    id: int
    user_id: Optional[UUID]  # Allow None for anonymous feedback
    sent_at: datetime
    
    class Config:
        from_attributes = True