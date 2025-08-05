"""
Utility functions for generating realistic sample data
"""

import random
from datetime import datetime, timedelta, time
from typing import List, Dict, Any
from models.user import Gender, ActivityLevel, GoalType, TimeFrame


class SampleDataGenerator:
    """Generate realistic sample data for users and profiles"""
    
    @staticmethod
    def generate_realistic_weight_progression(
        initial_weight: float,
        target_weight: float,
        goal: GoalType,
        days: int = 180
    ) -> List[Dict[str, Any]]:
        """Generate realistic weight progression over time"""
        
        progression = []
        current_weight = initial_weight
        total_change = target_weight - initial_weight
        
        # Different progression patterns based on goal
        if goal == GoalType.WEIGHT_LOSS:
            # Weight loss: faster initial loss, then slower
            weekly_loss_start = 0.8  # kg per week initially
            weekly_loss_end = 0.3    # kg per week later
        elif goal == GoalType.MUSCLE_GAIN:
            # Muscle gain: slower, more steady
            weekly_gain_start = 0.3  # kg per week initially  
            weekly_gain_end = 0.2    # kg per week later
        else:
            # Maintenance or recomp: minimal changes
            weekly_change = 0.1
        
        weeks = days // 7
        for week in range(weeks):
            # Add some randomness
            random_factor = random.uniform(0.8, 1.2)
            
            if goal == GoalType.WEIGHT_LOSS:
                # Exponential decay in loss rate
                progress_ratio = week / weeks
                weekly_loss = weekly_loss_start * (1 - progress_ratio) + weekly_loss_end * progress_ratio
                change = -weekly_loss * random_factor
            elif goal == GoalType.MUSCLE_GAIN:
                progress_ratio = week / weeks
                weekly_gain = weekly_gain_start * (1 - progress_ratio) + weekly_gain_end * progress_ratio
                change = weekly_gain * random_factor
            else:
                # Maintenance: small fluctuations
                change = random.uniform(-weekly_change, weekly_change)
            
            current_weight += change
            
            # Add plateau periods occasionally
            if random.random() < 0.15:  # 15% chance of plateau
                change = 0
            
            # Generate notes based on progress
            notes = SampleDataGenerator._generate_weight_notes(
                week, current_weight, initial_weight, goal, change
            )
            
            progression.append({
                "weight": round(current_weight, 1),
                "notes": notes,
                "days_ago": days - (week * 7)
            })
        
        return progression
    
    @staticmethod
    def _generate_weight_notes(
        week: int, 
        current_weight: float, 
        initial_weight: float, 
        goal: GoalType,
        weekly_change: float
    ) -> str:
        """Generate realistic notes for weight entries"""
        
        total_change = current_weight - initial_weight
        
        notes_options = []
        
        if week == 0:
            notes_options = [
                "Starting my journey!",
                "Day one, here we go!",
                "Ready to make changes",
                "Beginning weight tracking"
            ]
        elif weekly_change == 0:  # Plateau
            notes_options = [
                "Plateau week",
                "Weight staying steady",
                "No change this week",
                "Maintaining current weight"
            ]
        elif goal == GoalType.WEIGHT_LOSS:
            if weekly_change < -0.5:
                notes_options = [
                    "Great progress this week!",
                    "Feeling lighter",
                    "Diet is working well",
                    "Seeing results!"
                ]
            elif weekly_change < 0:
                notes_options = [
                    "Slow but steady",
                    "Small progress is progress",
                    "Still moving in right direction",
                    "Consistent effort paying off"
                ]
            else:
                notes_options = [
                    "Gained a bit this week",
                    "Need to refocus",
                    "Back on track next week",
                    "Minor setback"
                ]
        elif goal == GoalType.MUSCLE_GAIN:
            if weekly_change > 0.2:
                notes_options = [
                    "Gaining well!",
                    "Muscle building progress",
                    "Feeling stronger",
                    "Bulk going well"
                ]
            else:
                notes_options = [
                    "Steady gains",
                    "Slow and steady",
                    "Building lean mass",
                    "Patient progress"
                ]
        else:
            notes_options = [
                "Maintaining well",
                "Weight stable",
                "Feeling good",
                "Consistent habits"
            ]
        
        # Add milestone notes
        if abs(total_change) >= 5 and week > 4:
            if goal == GoalType.WEIGHT_LOSS:
                notes_options.append(f"{abs(total_change):.1f}kg down total!")
            elif goal == GoalType.MUSCLE_GAIN:
                notes_options.append(f"{total_change:.1f}kg gained so far!")
        
        return random.choice(notes_options)
    
    @staticmethod
    def generate_diet_preferences() -> Dict[str, Any]:
        """Generate realistic diet preferences"""
        
        dietary_restrictions_options = [
            [],
            ["vegetarian"],
            ["vegan"],
            ["pescatarian"],
            ["keto"],
            ["paleo"],
            ["gluten_free"],
            ["dairy_free"],
            ["low_carb"],
            ["mediterranean"],
            ["vegetarian", "gluten_free"],
            ["vegan", "gluten_free"]
        ]
        
        allergies_options = [
            [],
            ["nuts"],
            ["shellfish"],
            ["eggs"],
            ["dairy"],
            ["gluten"],
            ["soy"],
            ["nuts", "shellfish"],
            ["eggs", "dairy"]
        ]
        
        cuisine_preferences_options = [
            ["american", "italian"],
            ["asian", "mediterranean"],
            ["mexican", "indian"],
            ["italian", "french"],
            ["japanese", "thai"],
            ["middle_eastern", "mediterranean"],
            ["american", "mexican", "italian"]
        ]
        
        cooking_skills = ["beginner", "intermediate", "advanced", "expert"]
        budget_preferences = ["budget", "moderate", "premium"]
        
        return {
            "dietary_restrictions": random.choice(dietary_restrictions_options),
            "allergies": random.choice(allergies_options),
            "cuisine_preferences": random.choice(cuisine_preferences_options),
            "cooking_skill": random.choice(cooking_skills),
            "meal_prep_time": random.choice([15, 30, 45, 60, 90, 120]),
            "budget_preference": random.choice(budget_preferences)
        }
    
    @staticmethod
    def generate_meal_times() -> Dict[str, time]:
        """Generate realistic meal times"""
        
        # Common meal time patterns
        patterns = [
            # Early bird
            {
                "breakfast": time(6, 0),
                "lunch": time(11, 30),
                "dinner": time(17, 30)
            },
            # Standard schedule
            {
                "breakfast": time(7, 30),
                "lunch": time(12, 30),
                "dinner": time(18, 30)
            },
            # Late schedule
            {
                "breakfast": time(8, 30),
                "lunch": time(13, 30),
                "dinner": time(20, 0)
            },
            # Intermittent fasting
            {
                "breakfast": time(11, 0),  # Actually first meal
                "lunch": time(14, 0),
                "dinner": time(18, 0)
            }
        ]
        
        return random.choice(patterns)
    
    @staticmethod
    def generate_feedback_messages() -> List[str]:
        """Generate realistic user feedback messages"""
        
        positive_feedback = [
            "Love this app! It's made tracking so much easier.",
            "The meal suggestions are really helpful.",
            "Great progress tracking features.",
            "UI is clean and easy to use.",
            "Perfect for my weight loss journey.",
            "The water reminders are a game changer.",
            "Love the macro tracking functionality.",
            "Barcode scanning saves so much time.",
            "The progress charts keep me motivated.",
            "Exactly what I needed for my fitness goals."
        ]
        
        constructive_feedback = [
            "Would love more vegetarian meal options.",
            "Could use more breakfast recipes.",
            "The search could be faster.",
            "More detailed nutritional info would be great.",
            "Love to see meal planning features.",
            "Exercise tracking integration would be awesome.",
            "More customization options please.",
            "Offline mode would be helpful.",
            "Social features for motivation would be cool.",
            "More diet-specific meal suggestions needed."
        ]
        
        feature_requests = [
            "Can we get a dark mode option?",
            "Grocery list generation would be amazing.",
            "Recipe scaling for different portions please.",
            "Integration with fitness trackers would be great.",
            "Family meal planning features needed.",
            "Restaurant menu scanning would be helpful.",
            "Meal prep planning tools please.",
            "More detailed analytics and insights.",
            "Custom goal setting options.",
            "Export data functionality would be useful."
        ]
        
        all_feedback = positive_feedback + constructive_feedback + feature_requests
        return random.sample(all_feedback, min(3, len(all_feedback)))
    
    @staticmethod
    def generate_user_profile_data(age_range=(18, 65)) -> Dict[str, Any]:
        """Generate complete realistic user profile data"""
        
        age = random.randint(*age_range)
        gender = random.choice(list(Gender))
        
        # Height based on gender (realistic distributions)
        if gender == Gender.MALE:
            height = random.normalvariate(175, 8)  # cm
            base_weight = random.normalvariate(75, 12)  # kg
        elif gender == Gender.FEMALE:
            height = random.normalvariate(162, 7)  # cm
            base_weight = random.normalvariate(62, 10)  # kg
        else:
            height = random.normalvariate(168, 10)  # cm
            base_weight = random.normalvariate(68, 12)  # kg
        
        height = max(150, min(200, height))  # Reasonable bounds
        base_weight = max(45, min(120, base_weight))  # Reasonable bounds
        
        # Goal and weight targets
        goal = random.choice(list(GoalType))
        
        if goal == GoalType.WEIGHT_LOSS:
            initial_weight = base_weight + random.uniform(5, 20)
            current_weight = initial_weight - random.uniform(0, 10)
            target_weight = current_weight - random.uniform(3, 15)
        elif goal == GoalType.MUSCLE_GAIN:
            initial_weight = base_weight - random.uniform(5, 15)
            current_weight = initial_weight + random.uniform(0, 8)
            target_weight = current_weight + random.uniform(3, 12)
        elif goal == GoalType.BODY_RECOMPOSITION:
            initial_weight = base_weight
            current_weight = initial_weight + random.uniform(-2, 4)
            target_weight = current_weight + random.uniform(-3, 5)
        else:  # MAINTAIN
            initial_weight = base_weight
            current_weight = initial_weight + random.uniform(-2, 2)
            target_weight = current_weight + random.uniform(-1, 1)
        
        activity_level = random.choice(list(ActivityLevel))
        time_frame = random.choice(list(TimeFrame))
        
        # Water goal based on weight and activity
        base_water = current_weight * 35  # 35ml per kg
        if activity_level in [ActivityLevel.VERY_ACTIVE, ActivityLevel.EXTREMELY_ACTIVE]:
            base_water += 500
        water_goal = round(base_water / 100) * 100  # Round to nearest 100ml
        
        meal_times = SampleDataGenerator.generate_meal_times()
        diet_prefs = SampleDataGenerator.generate_diet_preferences()
        
        return {
            "age": age,
            "gender": gender,
            "height": round(height, 1),
            "initial_weight": round(initial_weight, 1),
            "current_weight": round(current_weight, 1),
            "target_weight": round(target_weight, 1),
            "activity_level": activity_level,
            "goal": goal,
            "time_frame": time_frame,
            "water_goal": water_goal,
            "breakfast_time": meal_times["breakfast"],
            "lunch_time": meal_times["lunch"],
            "dinner_time": meal_times["dinner"],
            "diet_preferences": diet_prefs
        }