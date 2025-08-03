from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class NutritionBase(BaseModel):
    calories: Optional[float] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)
    carbs: Optional[float] = Field(None, ge=0)
    fat: Optional[float] = Field(None, ge=0)
    fiber: Optional[float] = Field(None, ge=0)
    water: Optional[float] = Field(None, ge=0)

class MealBase(BaseModel):
    description: Optional[str] = None
    image_url: Optional[str] = None

class MealCreate(MealBase, NutritionBase):
    logged_at: Optional[datetime] = None

class MealUpdate(BaseModel):
    description: Optional[str] = None
    calories: Optional[float] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)
    carbs: Optional[float] = Field(None, ge=0)
    fat: Optional[float] = Field(None, ge=0)
    fiber: Optional[float] = Field(None, ge=0)
    water: Optional[float] = Field(None, ge=0)

class Meal(MealBase, NutritionBase):
    id: int
    user_id: UUID
    logged_at: datetime
    
    class Config:
        from_attributes = True

class PhotoAnalysisRequest(BaseModel):
    image_url: str

class PhotoAnalysisResponse(NutritionBase):
    description: str
    confidence: float = Field(ge=0, le=1)

class ChatLogRequest(BaseModel):
    description: str

class ChatLogResponse(NutritionBase):
    parsed_description: str
    confidence: float = Field(ge=0, le=1)

class DailyNutritionSummary(NutritionBase):
    date: datetime
    meal_count: int
    calorie_goal: Optional[float] = None
    protein_goal: Optional[float] = None
    carbs_goal: Optional[float] = None
    fat_goal: Optional[float] = None

class WeeklyProgressData(BaseModel):
    week_start: datetime
    daily_summaries: list[DailyNutritionSummary]
    avg_calories: float
    avg_protein: float
    avg_carbs: float
    avg_fat: float