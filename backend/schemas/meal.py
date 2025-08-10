from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class NutritionBase(BaseModel):
    calories: Optional[float] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)
    carbs: Optional[float] = Field(None, ge=0)
    fat: Optional[float] = Field(None, ge=0)
    fiber: Optional[float] = Field(None, ge=0)
    water: Optional[float] = Field(None, ge=0)
    
    # Micronutrients
    sodium: Optional[float] = Field(None, ge=0, description="Sodium in mg")
    potassium: Optional[float] = Field(None, ge=0, description="Potassium in mg")
    calcium: Optional[float] = Field(None, ge=0, description="Calcium in mg")
    magnesium: Optional[float] = Field(None, ge=0, description="Magnesium in mg")
    iron: Optional[float] = Field(None, ge=0, description="Iron in mg")
    zinc: Optional[float] = Field(None, ge=0, description="Zinc in mg")
    vitamin_c: Optional[float] = Field(None, ge=0, description="Vitamin C in mg")
    vitamin_d: Optional[float] = Field(None, ge=0, description="Vitamin D in mcg")
    vitamin_b12: Optional[float] = Field(None, ge=0, description="Vitamin B12 in mcg")
    folate: Optional[float] = Field(None, ge=0, description="Folate in mcg")

class MealBase(BaseModel):
    description: Optional[str] = None
    image_url: Optional[str] = None
    meal_type: Optional[str] = Field(None, description="Meal type: breakfast, lunch, dinner, snack")
    preparation_method: Optional[str] = Field(None, description="How the meal was prepared")
    ingredients: Optional[List[str]] = Field(None, description="List of ingredients")
    dietary_tags: Optional[List[str]] = Field(None, description="Dietary tags: vegan, gluten-free, etc.")

    @validator('meal_type')
    def validate_meal_type(cls, v):
        if v is not None:
            valid_types = ['breakfast', 'lunch', 'dinner', 'snack', 'beverage']
            if v.lower() not in valid_types:
                raise ValueError(f"Invalid meal type. Must be one of: {valid_types}")
            return v.lower()
        return v

    @validator('dietary_tags')
    def validate_dietary_tags(cls, v):
        if v is not None:
            valid_tags = [
                'vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'low-carb', 
                'keto', 'paleo', 'low-sodium', 'high-protein', 'low-fat',
                'high-fiber', 'organic', 'raw', 'low-fodmap', 'halal', 'kosher'
            ]
            for tag in v:
                if tag.lower() not in valid_tags:
                    raise ValueError(f"Invalid dietary tag: {tag}")
            return [tag.lower() for tag in v]
        return v

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
    
    # Micronutrients
    sodium: Optional[float] = Field(None, ge=0)
    potassium: Optional[float] = Field(None, ge=0)
    calcium: Optional[float] = Field(None, ge=0)
    magnesium: Optional[float] = Field(None, ge=0)
    iron: Optional[float] = Field(None, ge=0)
    zinc: Optional[float] = Field(None, ge=0)
    vitamin_c: Optional[float] = Field(None, ge=0)
    vitamin_d: Optional[float] = Field(None, ge=0)
    vitamin_b12: Optional[float] = Field(None, ge=0)
    folate: Optional[float] = Field(None, ge=0)
    
    # Additional metadata
    meal_type: Optional[str] = None
    preparation_method: Optional[str] = None
    ingredients: Optional[List[str]] = None
    dietary_tags: Optional[List[str]] = None

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