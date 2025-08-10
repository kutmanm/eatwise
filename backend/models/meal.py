from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from .user import Base

class Meal(Base):
    __tablename__ = "meals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)
    water = Column(Float, nullable=True)
    
    # Micronutrients (in mg unless otherwise specified)
    sodium = Column(Float, nullable=True)  # mg
    potassium = Column(Float, nullable=True)  # mg
    calcium = Column(Float, nullable=True)  # mg
    magnesium = Column(Float, nullable=True)  # mg
    iron = Column(Float, nullable=True)  # mg
    zinc = Column(Float, nullable=True)  # mg
    vitamin_c = Column(Float, nullable=True)  # mg
    vitamin_d = Column(Float, nullable=True)  # mcg
    vitamin_b12 = Column(Float, nullable=True)  # mcg
    folate = Column(Float, nullable=True)  # mcg
    
    # Additional meal metadata
    meal_type = Column(String, nullable=True)  # breakfast, lunch, dinner, snack
    preparation_method = Column(String, nullable=True)  # grilled, fried, baked, etc.
    ingredients = Column(JSON, nullable=True)  # List of ingredients
    dietary_tags = Column(JSON, nullable=True)  # vegan, gluten-free, etc.
    logged_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    user = relationship("User", back_populates="meals")
    
    __table_args__ = (
        Index('ix_meals_user_logged', 'user_id', 'logged_at'),
    )