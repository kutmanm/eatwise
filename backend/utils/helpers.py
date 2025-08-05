import os
import logging
from typing import Any, Dict, Optional
from datetime import datetime
from models.user import ActivityLevel, GoalType
from alembic.config import Config
from alembic import command
import time

logger = logging.getLogger(__name__)

def run_migrations():
    """Run database migrations using Alembic with proper error handling"""
    try:
        # Import settings here to avoid circular imports
        from utils.config import settings
        
        # Get the directory containing alembic.ini
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alembic_cfg_path = os.path.join(backend_dir, "alembic.ini")
        
        # Create Alembic configuration
        alembic_cfg = Config(alembic_cfg_path)
        
        # Override the database URL with the one from settings
        alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
        
        logger.info(f"Running database migrations using database: {settings.database_url[:30]}...")
        
        # Run migrations
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully")
            
    except Exception as e:
        logger.error(f"Failed to run database migrations: {e}")
        logger.error("Please check your DATABASE_URL environment variable and database connectivity.")
        # Log the database URL (masked for security)
        try:
            from utils.config import settings
            masked_url = settings.database_url[:30] + "..." if len(settings.database_url) > 30 else settings.database_url
            logger.error(f"Current DATABASE_URL: {masked_url}")
        except:
            logger.error("Could not load DATABASE_URL from settings")
        raise

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