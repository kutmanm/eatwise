from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from models.user import UserRole, ActivityLevel, GoalType

class UserProfileBase(BaseModel):
    age: int = Field(ge=1, le=120)
    height: float = Field(ge=50, le=300)
    weight: float = Field(ge=20, le=500)
    target_weight: Optional[float] = Field(None, ge=20, le=500)
    timeframe_days: Optional[int] = Field(None, ge=1, le=3650)  # От 1 дня до 10 лет
    activity_level: ActivityLevel
    goal: GoalType

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=1, le=120)
    height: Optional[float] = Field(None, ge=50, le=300)
    weight: Optional[float] = Field(None, ge=20, le=500)
    target_weight: Optional[float] = Field(None, ge=20, le=500)
    timeframe_days: Optional[int] = Field(None, ge=1, le=3650)
    activity_level: Optional[ActivityLevel] = None
    goal: Optional[GoalType] = None

class UserProfile(UserProfileBase):
    id: int
    user_id: UUID
    
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
    active: bool
    
    class Config:
        from_attributes = True