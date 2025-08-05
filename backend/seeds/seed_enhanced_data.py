"""
Enhanced database seeding script for EatWise application
Creates sample users with complete enhanced profiles, weight logs, and feedback
"""

import asyncio
from datetime import datetime, time, timedelta
from sqlalchemy.orm import Session
import sys
import os

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import SessionLocal, engine
from models.user import (
    User, UserProfile, WeightLog, UserFeedback, Subscription,
    UserRole, Gender, ActivityLevel, GoalType, TimeFrame
)
from utils.helpers import calculate_bmr, calculate_tdee, calculate_calorie_goal, calculate_macro_targets
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

class EnhancedDataSeeder:
    """Enhanced data seeder with realistic user profiles and tracking data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_sample_users(self):
        """Create diverse sample users with enhanced profiles"""
        sample_users = [
            {
                "email": "sarah.johnson@example.com",
                "password": "password123",
                "role": UserRole.FREE,
                "profile": {
                    "age": 28,
                    "gender": Gender.FEMALE,
                    "height": 165.0,
                    "initial_weight": 70.0,
                    "current_weight": 65.0,
                    "target_weight": 60.0,
                    "activity_level": ActivityLevel.MODERATELY_ACTIVE,
                    "goal": GoalType.WEIGHT_LOSS,
                    "time_frame": TimeFrame.SIX_MONTHS,
                    "water_goal": 2500.0,
                    "breakfast_time": time(7, 30),
                    "lunch_time": time(12, 0),
                    "dinner_time": time(18, 30),
                    "diet_preferences": {
                        "dietary_restrictions": ["vegetarian"],
                        "allergies": ["nuts"],
                        "cuisine_preferences": ["mediterranean", "asian"],
                        "cooking_skill": "intermediate",
                        "meal_prep_time": 45,
                        "budget_preference": "moderate"
                    }
                },
                "weight_history": [
                    {"weight": 70.0, "notes": "Starting weight", "days_ago": 120},
                    {"weight": 69.2, "notes": "First week down!", "days_ago": 113},
                    {"weight": 68.5, "notes": "Feeling great", "days_ago": 106},
                    {"weight": 67.8, "notes": "Plateau week", "days_ago": 99},
                    {"weight": 67.0, "notes": "Breaking through", "days_ago": 92},
                    {"weight": 66.5, "notes": "New workout routine", "days_ago": 85},
                    {"weight": 65.8, "notes": "Consistent progress", "days_ago": 78},
                    {"weight": 65.2, "notes": "Halfway there!", "days_ago": 71},
                    {"weight": 65.0, "notes": "Current weight", "days_ago": 0}
                ],
                "feedback": [
                    "Love the meal tracking feature!",
                    "The water reminder is really helpful",
                    "Would love more vegetarian meal suggestions"
                ]
            },
            {
                "email": "mike.chen@example.com",
                "password": "password123",
                "role": UserRole.PREMIUM,
                "profile": {
                    "age": 32,
                    "gender": Gender.MALE,
                    "height": 180.0,
                    "initial_weight": 75.0,
                    "current_weight": 78.0,
                    "target_weight": 85.0,
                    "activity_level": ActivityLevel.VERY_ACTIVE,
                    "goal": GoalType.MUSCLE_GAIN,
                    "time_frame": TimeFrame.ONE_YEAR,
                    "water_goal": 3500.0,
                    "breakfast_time": time(6, 0),
                    "lunch_time": time(12, 30),
                    "dinner_time": time(19, 0),
                    "diet_preferences": {
                        "dietary_restrictions": [],
                        "allergies": ["shellfish"],
                        "cuisine_preferences": ["american", "italian"],
                        "cooking_skill": "beginner",
                        "meal_prep_time": 30,
                        "budget_preference": "premium"
                    }
                },
                "weight_history": [
                    {"weight": 75.0, "notes": "Starting bulk", "days_ago": 180},
                    {"weight": 75.5, "notes": "First gains", "days_ago": 160},
                    {"weight": 76.2, "notes": "Steady progress", "days_ago": 140},
                    {"weight": 76.8, "notes": "Increased calories", "days_ago": 120},
                    {"weight": 77.5, "notes": "New PR in gym", "days_ago": 100},
                    {"weight": 78.0, "notes": "Loving the gains", "days_ago": 0}
                ],
                "feedback": [
                    "Great app for tracking my bulk!",
                    "Premium features are worth it",
                    "Love the macro tracking"
                ]
            },
            {
                "email": "emma.martinez@example.com", 
                "password": "password123",
                "role": UserRole.TRIAL,
                "profile": {
                    "age": 25,
                    "gender": Gender.FEMALE,
                    "height": 158.0,
                    "initial_weight": 62.0,
                    "current_weight": 62.0,
                    "target_weight": 62.0,
                    "activity_level": ActivityLevel.LIGHTLY_ACTIVE,
                    "goal": GoalType.MAINTAIN,
                    "time_frame": TimeFrame.THREE_MONTHS,
                    "water_goal": 2000.0,
                    "breakfast_time": time(8, 0),
                    "lunch_time": time(13, 0),
                    "dinner_time": time(20, 0),
                    "diet_preferences": {
                        "dietary_restrictions": ["gluten_free", "dairy_free"],
                        "allergies": ["gluten", "milk"],
                        "cuisine_preferences": ["mexican", "indian"],
                        "cooking_skill": "advanced",
                        "meal_prep_time": 60,
                        "budget_preference": "budget"
                    }
                },
                "weight_history": [
                    {"weight": 62.0, "notes": "Maintaining well", "days_ago": 30},
                    {"weight": 61.8, "notes": "Slight dip", "days_ago": 20},
                    {"weight": 62.2, "notes": "Back to normal", "days_ago": 10},
                    {"weight": 62.0, "notes": "Stable weight", "days_ago": 0}
                ],
                "feedback": [
                    "Perfect for maintaining my weight",
                    "Love the gluten-free meal options"
                ]
            },
            {
                "email": "david.kim@example.com",
                "password": "password123", 
                "role": UserRole.FREE,
                "profile": {
                    "age": 45,
                    "gender": Gender.MALE,
                    "height": 175.0,
                    "initial_weight": 95.0,
                    "current_weight": 88.0,
                    "target_weight": 80.0,
                    "activity_level": ActivityLevel.SEDENTARY,
                    "goal": GoalType.WEIGHT_LOSS,
                    "time_frame": TimeFrame.ONE_YEAR,
                    "water_goal": 2800.0,
                    "breakfast_time": time(7, 0),
                    "lunch_time": time(12, 30),
                    "dinner_time": time(18, 0),
                    "diet_preferences": {
                        "dietary_restrictions": ["low_carb"],
                        "allergies": [],
                        "cuisine_preferences": ["asian", "mediterranean"],
                        "cooking_skill": "intermediate",
                        "meal_prep_time": 40,
                        "budget_preference": "moderate"
                    }
                },
                "weight_history": [
                    {"weight": 95.0, "notes": "Starting my journey", "days_ago": 200},
                    {"weight": 93.5, "notes": "First 1.5kg down", "days_ago": 180},
                    {"weight": 92.0, "notes": "Feeling lighter", "days_ago": 160},
                    {"weight": 90.5, "notes": "Making progress", "days_ago": 140},
                    {"weight": 89.2, "notes": "Almost under 90!", "days_ago": 120},
                    {"weight": 88.8, "notes": "Under 90kg!", "days_ago": 100},
                    {"weight": 88.0, "notes": "7kg down total", "days_ago": 0}
                ],
                "feedback": [
                    "This app changed my life!",
                    "Slow and steady progress",
                    "Low carb meal suggestions are great"
                ]
            },
            {
                "email": "alex.taylor@example.com",
                "password": "password123",
                "role": UserRole.PREMIUM,
                "profile": {
                    "age": 29,
                    "gender": Gender.OTHER,
                    "height": 170.0,
                    "initial_weight": 68.0,
                    "current_weight": 70.0,
                    "target_weight": 72.0,
                    "activity_level": ActivityLevel.EXTREMELY_ACTIVE,
                    "goal": GoalType.BODY_RECOMPOSITION,
                    "time_frame": TimeFrame.SIX_MONTHS,
                    "water_goal": 4000.0,
                    "breakfast_time": time(5, 30),
                    "lunch_time": time(11, 30),
                    "dinner_time": time(17, 30),
                    "diet_preferences": {
                        "dietary_restrictions": ["paleo"],
                        "allergies": ["soy"],
                        "cuisine_preferences": ["american", "mediterranean"],
                        "cooking_skill": "expert",
                        "meal_prep_time": 90,
                        "budget_preference": "premium"
                    }
                },
                "weight_history": [
                    {"weight": 68.0, "notes": "Starting recomp", "days_ago": 90},
                    {"weight": 68.5, "notes": "Building muscle", "days_ago": 75},
                    {"weight": 69.0, "notes": "Getting stronger", "days_ago": 60},
                    {"weight": 69.5, "notes": "Lean gains", "days_ago": 45},
                    {"weight": 70.0, "notes": "Feeling amazing", "days_ago": 0}
                ],
                "feedback": [
                    "Perfect for body recomposition goals",
                    "Love the detailed macro tracking",
                    "Paleo meal suggestions are spot on"
                ]
            }
        ]
        
        created_users = []
        for user_data in sample_users:
            # Create user
            user = User(
                email=user_data["email"],
                hashed_password=hash_password(user_data["password"]),
                role=user_data["role"],
                is_active=True
            )
            self.db.add(user)
            self.db.flush()  # Get user ID
            
            # Create profile
            profile_data = user_data["profile"]
            
            # Calculate goals
            bmr = calculate_bmr(
                profile_data["age"],
                profile_data["height"], 
                profile_data["current_weight"],
                profile_data["gender"] == Gender.MALE
            )
            tdee = calculate_tdee(bmr, profile_data["activity_level"])
            calorie_goal = calculate_calorie_goal(profile_data["current_weight"], profile_data["goal"], tdee)
            macro_targets = calculate_macro_targets(calorie_goal, profile_data["goal"])
            
            profile = UserProfile(
                user_id=user.id,
                age=profile_data["age"],
                gender=profile_data["gender"],
                height=profile_data["height"],
                initial_weight=profile_data["initial_weight"],
                current_weight=profile_data["current_weight"],
                target_weight=profile_data["target_weight"],
                activity_level=profile_data["activity_level"],
                goal=profile_data["goal"],
                time_frame=profile_data["time_frame"],
                water_goal=profile_data["water_goal"],
                calorie_goal=calorie_goal,
                protein_goal=macro_targets["protein"],
                carb_goal=macro_targets["carbs"],
                fat_goal=macro_targets["fat"],
                breakfast_time=profile_data["breakfast_time"],
                lunch_time=profile_data["lunch_time"],
                dinner_time=profile_data["dinner_time"],
                diet_preferences=profile_data["diet_preferences"]
            )
            self.db.add(profile)
            
            # Create subscription for premium users
            if user_data["role"] in [UserRole.PREMIUM, UserRole.TRIAL]:
                subscription = Subscription(
                    user_id=user.id,
                    plan="premium" if user_data["role"] == UserRole.PREMIUM else "trial",
                    start_date=datetime.utcnow() - timedelta(days=30),
                    end_date=datetime.utcnow() + timedelta(days=335) if user_data["role"] == UserRole.PREMIUM else datetime.utcnow() + timedelta(days=7),
                    status="active" if user_data["role"] == UserRole.PREMIUM else "trialing"
                )
                self.db.add(subscription)
            
            # Create weight logs
            for weight_entry in user_data["weight_history"]:
                weight_log = WeightLog(
                    user_id=user.id,
                    weight=weight_entry["weight"],
                    notes=weight_entry["notes"],
                    logged_at=datetime.utcnow() - timedelta(days=weight_entry["days_ago"])
                )
                self.db.add(weight_log)
            
            # Create user feedback
            for feedback_text in user_data["feedback"]:
                feedback = UserFeedback(
                    user_id=user.id,
                    message=feedback_text,
                    sent_at=datetime.utcnow() - timedelta(days=30, hours=12)
                )
                self.db.add(feedback)
            
            created_users.append(user)
        
        self.db.commit()
        return created_users
    
    def create_additional_sample_data(self):
        """Create additional sample data for variety"""
        
        # Additional diet preference variations
        diet_variations = [
            {
                "dietary_restrictions": ["keto"],
                "cooking_skill": "beginner",
                "budget_preference": "budget"
            },
            {
                "dietary_restrictions": ["vegan", "gluten_free"],
                "allergies": ["eggs", "dairy"],
                "cooking_skill": "expert",
                "budget_preference": "premium"
            },
            {
                "dietary_restrictions": ["pescatarian"],
                "cuisine_preferences": ["japanese", "thai"],
                "cooking_skill": "advanced"
            }
        ]
        
        # Get existing users to add variety
        users = self.db.query(User).all()
        
        for i, user in enumerate(users[:3]):  # Add to first 3 users
            if i < len(diet_variations):
                profile = self.db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
                if profile:
                    # Update diet preferences with variations
                    current_prefs = profile.diet_preferences or {}
                    current_prefs.update(diet_variations[i])
                    profile.diet_preferences = current_prefs
        
        self.db.commit()
    
    def seed_all(self):
        """Run all seeding operations"""
        print("🌱 Starting enhanced database seeding...")
        
        # Create sample users with complete profiles
        users = self.create_sample_users()
        print(f"✅ Created {len(users)} sample users with enhanced profiles")
        
        # Add additional sample data
        self.create_additional_sample_data()
        print("✅ Added additional sample data variations")
        
        print("🎉 Enhanced database seeding completed successfully!")
        print("\n📋 Sample Users Created:")
        for user in users:
            profile = self.db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
            weight_logs_count = self.db.query(WeightLog).filter(WeightLog.user_id == user.id).count()
            print(f"  • {user.email} ({user.role.value}) - {profile.goal.value} - {weight_logs_count} weight entries")


def main():
    """Main seeding function"""
    print("🔄 Initializing database connection...")
    
    # Create tables if they don't exist
    from models.user import Base
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Clear existing sample data (optional)
        clear_existing = input("Clear existing sample data? (y/N): ").lower() == 'y'
        
        if clear_existing:
            print("🧹 Clearing existing sample data...")
            # Delete in reverse order of dependencies
            db.query(UserFeedback).delete()
            db.query(WeightLog).delete()
            db.query(Subscription).delete()
            db.query(UserProfile).delete()
            # Keep actual users, just delete sample ones
            sample_emails = [
                "sarah.johnson@example.com",
                "mike.chen@example.com", 
                "emma.martinez@example.com",
                "david.kim@example.com",
                "alex.taylor@example.com"
            ]
            for email in sample_emails:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    db.delete(user)
            db.commit()
            print("✅ Cleared existing sample data")
        
        # Run seeder
        seeder = EnhancedDataSeeder(db)
        seeder.seed_all()
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()