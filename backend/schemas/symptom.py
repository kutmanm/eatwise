from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from models.symptom import SymptomType, SymptomSeverity, SymptomDomain


class SymptomLogBase(BaseModel):
    symptom_type: str = Field(..., description="Type of symptom experienced")
    symptom_domain: str = Field(..., description="Domain category of the symptom")
    severity: int = Field(..., ge=1, le=10, description="Severity on a scale of 1-10")
    occurred_at: datetime = Field(..., description="When the symptom occurred")
    duration_minutes: Optional[int] = Field(None, ge=0, description="Duration of symptom in minutes")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes about the symptom")
    triggers: Optional[List[str]] = Field(None, description="Suspected triggers for the symptom")

    @validator('symptom_type')
    def validate_symptom_type(cls, v):
        # Convert enum value or validate string
        if hasattr(SymptomType, v.upper()):
            return v.lower()
        valid_types = [t.value for t in SymptomType]
        if v not in valid_types:
            raise ValueError(f"Invalid symptom type. Must be one of: {valid_types}")
        return v

    @validator('symptom_domain')
    def validate_symptom_domain(cls, v):
        valid_domains = [d.value for d in SymptomDomain]
        if v not in valid_domains:
            raise ValueError(f"Invalid symptom domain. Must be one of: {valid_domains}")
        return v

    @validator('occurred_at')
    def validate_occurred_at(cls, v):
        if v > datetime.now():
            raise ValueError("Symptom occurrence time cannot be in the future")
        return v


class SymptomLogCreate(SymptomLogBase):
    pass


class SymptomLogUpdate(BaseModel):
    symptom_type: Optional[str] = None
    symptom_domain: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=10)
    occurred_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=1000)
    triggers: Optional[List[str]] = None

    @validator('symptom_type')
    def validate_symptom_type(cls, v):
        if v is None:
            return v
        valid_types = [t.value for t in SymptomType]
        if v not in valid_types:
            raise ValueError(f"Invalid symptom type. Must be one of: {valid_types}")
        return v

    @validator('symptom_domain')
    def validate_symptom_domain(cls, v):
        if v is None:
            return v
        valid_domains = [d.value for d in SymptomDomain]
        if v not in valid_domains:
            raise ValueError(f"Invalid symptom domain. Must be one of: {valid_domains}")
        return v


class SymptomLog(SymptomLogBase):
    id: int
    user_id: UUID
    logged_at: datetime

    class Config:
        from_attributes = True


class LifestyleLogBase(BaseModel):
    date: datetime = Field(..., description="Date of the lifestyle log")
    sleep_hours: Optional[float] = Field(None, ge=0, le=24, description="Hours of sleep")
    sleep_quality: Optional[int] = Field(None, ge=1, le=10, description="Sleep quality on a scale of 1-10")
    stress_level: Optional[int] = Field(None, ge=1, le=10, description="Stress level on a scale of 1-10")
    exercise_minutes: Optional[int] = Field(None, ge=0, description="Minutes of exercise")
    exercise_type: Optional[str] = Field(None, max_length=100, description="Type of exercise")
    water_intake: Optional[float] = Field(None, ge=0, description="Water intake in liters")
    alcohol_servings: Optional[int] = Field(None, ge=0, description="Number of alcoholic drinks")
    medications: Optional[List[str]] = Field(None, description="Medications taken")
    supplements: Optional[List[str]] = Field(None, description="Supplements taken")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")


class LifestyleLogCreate(LifestyleLogBase):
    pass


class LifestyleLogUpdate(BaseModel):
    date: Optional[datetime] = None
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    sleep_quality: Optional[int] = Field(None, ge=1, le=10)
    stress_level: Optional[int] = Field(None, ge=1, le=10)
    exercise_minutes: Optional[int] = Field(None, ge=0)
    exercise_type: Optional[str] = Field(None, max_length=100)
    water_intake: Optional[float] = Field(None, ge=0)
    alcohol_servings: Optional[int] = Field(None, ge=0)
    medications: Optional[List[str]] = None
    supplements: Optional[List[str]] = None
    notes: Optional[str] = Field(None, max_length=1000)


class LifestyleLog(LifestyleLogBase):
    id: int
    user_id: UUID
    logged_at: datetime

    class Config:
        from_attributes = True


class SymptomAnalysisRequest(BaseModel):
    """Request for AI analysis of symptoms and their correlations"""
    symptom_domain: Optional[str] = Field(None, description="Focus on specific symptom domain")
    date_range_days: int = Field(7, ge=1, le=90, description="Number of days to analyze")
    include_lifestyle: bool = Field(True, description="Include lifestyle factors in analysis")


class SymptomCorrelationData(BaseModel):
    """Data structure for symptom correlation analysis"""
    symptom_logs: List[SymptomLog]
    lifestyle_logs: List[LifestyleLog]
    meal_data: List[Dict[str, Any]]
    analysis_period_days: int
    patterns_found: List[Dict[str, Any]]


class SymptomInsight(BaseModel):
    """AI-generated insights about symptom patterns"""
    summary: str = Field(..., description="Summary of findings")
    potential_triggers: List[str] = Field(..., description="Identified potential triggers")
    recommendations: List[str] = Field(..., description="Actionable recommendations")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence in the analysis")
    data_quality_score: float = Field(..., ge=0, le=1, description="Quality of input data")
