from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from models.user import User
from models.meal import Meal
from models.symptom import SymptomLog, LifestyleLog
from datetime import datetime, timedelta
import logging


logger = logging.getLogger(__name__)


class ValidationRule:
    def __init__(self, name: str, description: str, severity: str = "warning"):
        self.name = name
        self.description = description
        self.severity = severity  # "error", "warning", "info"


class ValidationResult:
    def __init__(self, rule: ValidationRule, passed: bool, message: str = "", data: Dict[str, Any] = None):
        self.rule = rule
        self.passed = passed
        self.message = message
        self.data = data or {}


class DataValidator:
    """Comprehensive data validation and quality assurance"""
    
    def __init__(self):
        self.rules = {
            "meal_validation": [
                ValidationRule("calorie_range", "Calories should be within reasonable range", "warning"),
                ValidationRule("macro_consistency", "Macronutrients should add up roughly to calories", "warning"),
                ValidationRule("missing_timestamps", "Meals should have valid timestamps", "error"),
                ValidationRule("duplicate_meals", "Check for potential duplicate meal entries", "warning"),
                ValidationRule("nutrient_ratios", "Nutrient ratios should be within reasonable bounds", "info"),
            ],
            "symptom_validation": [
                ValidationRule("severity_consistency", "Symptom severity should be consistent with description", "warning"),
                ValidationRule("timestamp_logic", "Symptom timing should be logical", "error"),
                ValidationRule("symptom_frequency", "Check for unusually high symptom frequency", "warning"),
                ValidationRule("missing_context", "Symptoms should have adequate context", "info"),
            ],
            "lifestyle_validation": [
                ValidationRule("sleep_range", "Sleep hours should be within normal range", "warning"),
                ValidationRule("exercise_consistency", "Exercise data should be consistent", "info"),
                ValidationRule("stress_patterns", "Stress levels should follow logical patterns", "info"),
            ],
            "temporal_validation": [
                ValidationRule("chronological_order", "Events should be in chronological order", "error"),
                ValidationRule("future_timestamps", "No events should be in the future", "error"),
                ValidationRule("temporal_gaps", "Check for unusual gaps in logging", "info"),
            ]
        }
    
    async def validate_meal_data(self, user: User, db: Session, days: int = 30) -> List[ValidationResult]:
        """Validate meal data quality and consistency"""
        results = []
        
        # Get recent meals
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        meals = db.query(Meal).filter(
            Meal.user_id == user.id,
            Meal.logged_at >= start_date,
            Meal.logged_at <= end_date
        ).order_by(Meal.logged_at).all()
        
        if not meals:
            return [ValidationResult(
                ValidationRule("no_data", "No meal data found", "info"),
                False,
                "No meals found in the specified time period"
            )]
        
        # Calorie range validation
        calorie_issues = []
        for meal in meals:
            if meal.calories:
                if meal.calories < 50 or meal.calories > 2000:
                    calorie_issues.append({
                        "meal_id": meal.id,
                        "calories": meal.calories,
                        "description": meal.description,
                        "date": meal.logged_at.strftime("%Y-%m-%d")
                    })
        
        results.append(ValidationResult(
            self.rules["meal_validation"][0],
            len(calorie_issues) == 0,
            f"Found {len(calorie_issues)} meals with unusual calorie values",
            {"issues": calorie_issues}
        ))
        
        # Macro consistency validation
        macro_issues = []
        for meal in meals:
            if all([meal.calories, meal.protein, meal.carbs, meal.fat]):
                calculated_calories = (meal.protein * 4) + (meal.carbs * 4) + (meal.fat * 9)
                if abs(calculated_calories - meal.calories) > meal.calories * 0.3:  # 30% tolerance
                    macro_issues.append({
                        "meal_id": meal.id,
                        "logged_calories": meal.calories,
                        "calculated_calories": round(calculated_calories, 1),
                        "difference": round(abs(calculated_calories - meal.calories), 1)
                    })
        
        results.append(ValidationResult(
            self.rules["meal_validation"][1],
            len(macro_issues) == 0,
            f"Found {len(macro_issues)} meals with macro/calorie inconsistencies",
            {"issues": macro_issues}
        ))
        
        # Duplicate meal detection
        duplicate_groups = self._find_duplicate_meals(meals)
        results.append(ValidationResult(
            self.rules["meal_validation"][3],
            len(duplicate_groups) == 0,
            f"Found {len(duplicate_groups)} potential duplicate meal groups",
            {"duplicates": duplicate_groups}
        ))
        
        # Timestamp validation
        timestamp_issues = []
        for meal in meals:
            if meal.logged_at > datetime.utcnow():
                timestamp_issues.append({
                    "meal_id": meal.id,
                    "timestamp": meal.logged_at.isoformat(),
                    "issue": "future_timestamp"
                })
        
        results.append(ValidationResult(
            self.rules["meal_validation"][2],
            len(timestamp_issues) == 0,
            f"Found {len(timestamp_issues)} meals with invalid timestamps",
            {"issues": timestamp_issues}
        ))
        
        return results
    
    async def validate_symptom_data(self, user: User, db: Session, days: int = 30) -> List[ValidationResult]:
        """Validate symptom data quality and consistency"""
        results = []
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        symptoms = db.query(SymptomLog).filter(
            SymptomLog.user_id == user.id,
            SymptomLog.occurred_at >= start_date,
            SymptomLog.occurred_at <= end_date
        ).order_by(SymptomLog.occurred_at).all()
        
        if not symptoms:
            return [ValidationResult(
                ValidationRule("no_symptom_data", "No symptom data found", "info"),
                True,
                "No symptoms logged in the specified time period"
            )]
        
        # Timestamp logic validation
        timestamp_issues = []
        for symptom in symptoms:
            if symptom.occurred_at > datetime.utcnow():
                timestamp_issues.append({
                    "symptom_id": symptom.id,
                    "occurred_at": symptom.occurred_at.isoformat(),
                    "issue": "future_timestamp"
                })
            
            if symptom.logged_at < symptom.occurred_at:
                timestamp_issues.append({
                    "symptom_id": symptom.id,
                    "issue": "logged_before_occurrence",
                    "occurred_at": symptom.occurred_at.isoformat(),
                    "logged_at": symptom.logged_at.isoformat()
                })
        
        results.append(ValidationResult(
            self.rules["symptom_validation"][1],
            len(timestamp_issues) == 0,
            f"Found {len(timestamp_issues)} symptoms with timestamp issues",
            {"issues": timestamp_issues}
        ))
        
        # Symptom frequency validation
        daily_counts = {}
        for symptom in symptoms:
            day = symptom.occurred_at.date()
            daily_counts[day] = daily_counts.get(day, 0) + 1
        
        high_frequency_days = [
            {"date": day.isoformat(), "count": count}
            for day, count in daily_counts.items()
            if count > 10  # More than 10 symptoms per day
        ]
        
        results.append(ValidationResult(
            self.rules["symptom_validation"][2],
            len(high_frequency_days) == 0,
            f"Found {len(high_frequency_days)} days with unusually high symptom frequency",
            {"high_frequency_days": high_frequency_days}
        ))
        
        # Missing context validation
        missing_context = []
        for symptom in symptoms:
            if not symptom.notes and not symptom.triggers:
                missing_context.append({
                    "symptom_id": symptom.id,
                    "symptom_type": symptom.symptom_type,
                    "severity": symptom.severity,
                    "date": symptom.occurred_at.strftime("%Y-%m-%d")
                })
        
        results.append(ValidationResult(
            self.rules["symptom_validation"][3],
            len(missing_context) < len(symptoms) * 0.5,  # Less than 50% missing context
            f"Found {len(missing_context)} symptoms with minimal context",
            {"missing_context": missing_context[:10]}  # Limit to first 10
        ))
        
        return results
    
    async def validate_lifestyle_data(self, user: User, db: Session, days: int = 30) -> List[ValidationResult]:
        """Validate lifestyle data quality"""
        results = []
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        lifestyle_logs = db.query(LifestyleLog).filter(
            LifestyleLog.user_id == user.id,
            LifestyleLog.date >= start_date,
            LifestyleLog.date <= end_date
        ).order_by(LifestyleLog.date).all()
        
        if not lifestyle_logs:
            return [ValidationResult(
                ValidationRule("no_lifestyle_data", "No lifestyle data found", "info"),
                True,
                "No lifestyle data logged in the specified time period"
            )]
        
        # Sleep range validation
        sleep_issues = []
        for log in lifestyle_logs:
            if log.sleep_hours:
                if log.sleep_hours < 2 or log.sleep_hours > 16:
                    sleep_issues.append({
                        "log_id": log.id,
                        "sleep_hours": log.sleep_hours,
                        "date": log.date.strftime("%Y-%m-%d")
                    })
        
        results.append(ValidationResult(
            self.rules["lifestyle_validation"][0],
            len(sleep_issues) == 0,
            f"Found {len(sleep_issues)} lifestyle logs with unusual sleep hours",
            {"issues": sleep_issues}
        ))
        
        return results
    
    def _find_duplicate_meals(self, meals: List[Meal]) -> List[List[Dict[str, Any]]]:
        """Find potential duplicate meal entries"""
        duplicates = []
        
        for i, meal1 in enumerate(meals):
            if not meal1.description:
                continue
                
            similar_meals = []
            for j, meal2 in enumerate(meals[i+1:], i+1):
                if not meal2.description:
                    continue
                
                # Check if meals are similar
                if self._meals_are_similar(meal1, meal2):
                    if not similar_meals:
                        similar_meals.append({
                            "meal_id": meal1.id,
                            "description": meal1.description,
                            "calories": meal1.calories,
                            "logged_at": meal1.logged_at.isoformat()
                        })
                    
                    similar_meals.append({
                        "meal_id": meal2.id,
                        "description": meal2.description,
                        "calories": meal2.calories,
                        "logged_at": meal2.logged_at.isoformat()
                    })
            
            if len(similar_meals) > 1:
                duplicates.append(similar_meals)
        
        return duplicates
    
    def _meals_are_similar(self, meal1: Meal, meal2: Meal) -> bool:
        """Check if two meals are potentially duplicates"""
        # Time window (within 2 hours)
        time_diff = abs((meal1.logged_at - meal2.logged_at).total_seconds())
        if time_diff > 7200:  # 2 hours
            return False
        
        # Description similarity (simple check)
        if meal1.description and meal2.description:
            desc1 = meal1.description.lower().strip()
            desc2 = meal2.description.lower().strip()
            if desc1 == desc2:
                return True
        
        # Calorie similarity (within 10%)
        if meal1.calories and meal2.calories:
            if abs(meal1.calories - meal2.calories) < meal1.calories * 0.1:
                return True
        
        return False
    
    async def validate_all_data(self, user: User, db: Session, days: int = 30) -> Dict[str, List[ValidationResult]]:
        """Run all validation checks"""
        return {
            "meal_validation": await self.validate_meal_data(user, db, days),
            "symptom_validation": await self.validate_symptom_data(user, db, days),
            "lifestyle_validation": await self.validate_lifestyle_data(user, db, days)
        }
    
    def get_validation_summary(self, validation_results: Dict[str, List[ValidationResult]]) -> Dict[str, Any]:
        """Generate a summary of validation results"""
        summary = {
            "total_checks": 0,
            "passed": 0,
            "warnings": 0,
            "errors": 0,
            "data_quality_score": 0,
            "recommendations": []
        }
        
        all_results = []
        for category, results in validation_results.items():
            all_results.extend(results)
        
        summary["total_checks"] = len(all_results)
        
        for result in all_results:
            if result.passed:
                summary["passed"] += 1
            else:
                if result.rule.severity == "error":
                    summary["errors"] += 1
                elif result.rule.severity == "warning":
                    summary["warnings"] += 1
        
        # Calculate data quality score (0-100)
        if summary["total_checks"] > 0:
            error_penalty = summary["errors"] * 20
            warning_penalty = summary["warnings"] * 5
            max_penalty = summary["total_checks"] * 20
            
            penalty = min(error_penalty + warning_penalty, max_penalty)
            summary["data_quality_score"] = max(0, 100 - (penalty * 100 / max_penalty))
        
        # Generate recommendations
        if summary["errors"] > 0:
            summary["recommendations"].append("Fix critical data errors to improve analysis accuracy")
        if summary["warnings"] > 3:
            summary["recommendations"].append("Review data entry practices to reduce inconsistencies")
        if summary["data_quality_score"] < 70:
            summary["recommendations"].append("Consider more consistent logging for better insights")
        
        return summary
