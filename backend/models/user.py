from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Enum, ForeignKey, Index, JSON, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, DeclarativeBase
import enum
import uuid
from datetime import datetime, time

class Base(DeclarativeBase):
    pass

class UserRole(enum.Enum):
    FREE = "free"
    PREMIUM = "premium"
    TRIAL = "trial"


class ActivityLevel(enum.Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTREMELY_ACTIVE = "extremely_active"


class GoalType(enum.Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    MAINTAIN = "maintain"
    BODY_RECOMPOSITION = "body_recomposition"
class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"
class TimeFrame(enum.Enum):
    WEEKS_2 = "2_weeks"
    MONTH_1 = "1_month"
    MONTHS_3 = "3_months"
    MONTHS_6 = "6_months"
    YEAR_1 = "1_year"
    CUSTOM = "custom"
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.TRIAL)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Stripe-specific fields
    stripe_customer_id = Column(String, nullable=True)
    subscription_id = Column(String, nullable=True)
    subscription_end = Column(DateTime, nullable=True)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    weight_logs = relationship("WeightLog", back_populates="user", cascade="all, delete-orphan")
    user_feedback = relationship("UserFeedback", back_populates="user", cascade="all, delete-orphan")
    symptom_logs = relationship("SymptomLog", back_populates="user", cascade="all, delete-orphan")
    lifestyle_logs = relationship("LifestyleLog", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic demographics
    age = Column(Integer, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    height = Column(Float, nullable=False)  # in cm
    
    # Weight information
    initial_weight = Column(Float, nullable=False)  # in kg - starting weight
    current_weight = Column(Float, nullable=False)  # in kg - current weight
    target_weight = Column(Float, nullable=False)   # in kg - goal weight
    
    # Goals and preferences
    activity_level = Column(Enum(ActivityLevel), nullable=False)
    goal = Column(Enum(GoalType), nullable=False)
    time_frame = Column(Enum(TimeFrame), nullable=False)
    target_date = Column(DateTime, nullable=True)  # specific target date if time_frame is CUSTOM
    
    # Nutrition goals
    water_goal = Column(Float, nullable=False, default=2000.0)  # in ml per day
    calorie_goal = Column(Float, nullable=True)  # calculated daily calorie target
    protein_goal = Column(Float, nullable=True)  # in grams per day
    carb_goal = Column(Float, nullable=True)     # in grams per day
    fat_goal = Column(Float, nullable=True)      # in grams per day
    
    # Meal preferences
    diet_preferences = Column(JSON, nullable=True)  # JSON field for flexible diet preferences
    # Example: {"dietary_restrictions": ["vegetarian", "gluten_free"], "allergies": ["nuts"], "cuisine_preferences": ["mediterranean", "asian"]}
    
    # Meal timing preferences
    breakfast_time = Column(Time, nullable=True, default=time(8, 0))
    lunch_time = Column(Time, nullable=True, default=time(12, 30))
    dinner_time = Column(Time, nullable=True, default=time(19, 0))
    snack_times = Column(JSON, nullable=True)  # Array of times for snacks
    # Example: ["10:30", "15:00", "21:00"]
    
    # Profile metadata
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class WeightLog(Base):
    __tablename__ = "weight_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    weight = Column(Float, nullable=False)  # in kg
    logged_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    notes = Column(String, nullable=True)  # Optional notes about the weigh-in
    
    user = relationship("User", back_populates="weight_logs")
    
    # Create composite index for efficient querying
    __table_args__ = (
        Index('ix_weight_logs_user_date', 'user_id', 'logged_at'),
    )
class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    plan = Column(String, nullable=False)  # e.g. 'premium_monthly'
    start_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="trialing")  # Stripe status: trialing, active, canceled, etc.
    
    user = relationship("User", back_populates="subscription")

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)  # Allow anonymous feedback
    message = Column(String, nullable=False)  # The feedback message content
    sent_at = Column(DateTime, nullable=False, default=datetime.utcnow)  # When the feedback was sent
    
    user = relationship("User", back_populates="user_feedback")
    
    # Create index for efficient querying by user and date
    __table_args__ = (
        Index('ix_user_feedback_user_date', 'user_id', 'sent_at'),
    )