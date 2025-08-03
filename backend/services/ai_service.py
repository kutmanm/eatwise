from typing import Dict, Any, Optional
import openai
from utils.config import settings
from schemas.meal import PhotoAnalysisResponse, ChatLogResponse
from models.user import User, GoalType
import json
import base64

openai.api_key = settings.openai_api_key

async def analyze_meal_photo(image_url: str) -> PhotoAnalysisResponse:
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a nutrition expert. Analyze the food image and provide detailed nutrition information. Return JSON with: description, calories, protein, carbs, fat, fiber, water (all nutrients in grams except calories), and confidence (0-1)."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this meal and estimate its nutritional content:"
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        result = json.loads(response.choices[0].message.content)
        return PhotoAnalysisResponse(**result)
    
    except Exception as e:
        return PhotoAnalysisResponse(
            description="Unable to analyze image",
            calories=0,
            protein=0,
            carbs=0,
            fat=0,
            fiber=0,
            water=0,
            confidence=0.0
        )

async def parse_meal_text(description: str) -> ChatLogResponse:
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a nutrition expert. Parse the meal description and estimate nutrition information. Return JSON with: parsed_description, calories, protein, carbs, fat, fiber, water (nutrients in grams except calories), and confidence (0-1)."
                },
                {
                    "role": "user",
                    "content": f"Parse this meal description and estimate nutrition: {description}"
                }
            ],
            max_tokens=400
        )
        
        result = json.loads(response.choices[0].message.content)
        return ChatLogResponse(**result)
    
    except Exception as e:
        return ChatLogResponse(
            parsed_description=description,
            calories=0,
            protein=0,
            carbs=0,
            fat=0,
            fiber=0,
            water=0,
            confidence=0.0
        )

async def generate_meal_feedback(
    meal_data: Dict[str, Any],
    user: User,
    daily_totals: Dict[str, float]
) -> str:
    try:
        goal_context = {
            GoalType.WEIGHT_LOSS: "weight loss",
            GoalType.MUSCLE_GAIN: "muscle gain",
            GoalType.MAINTAIN: "weight maintenance"
        }.get(user.profile.goal if user.profile else GoalType.MAINTAIN, "general health")
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a nutrition coach. Provide brief, encouraging feedback about this meal for someone with {goal_context} goals. Keep it under 100 words and focus on positive suggestions."
                },
                {
                    "role": "user",
                    "content": f"Meal: {meal_data.get('description', 'Unknown meal')} - {meal_data.get('calories', 0)} calories, {meal_data.get('protein', 0)}g protein, {meal_data.get('carbs', 0)}g carbs, {meal_data.get('fat', 0)}g fat. Daily totals so far: {daily_totals.get('calories', 0)} calories, {daily_totals.get('protein', 0)}g protein."
                }
            ],
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception:
        return "Great job logging your meal! Keep tracking your nutrition to reach your goals."

async def generate_daily_tip(user: User, recent_meals: list) -> str:
    try:
        goal_context = {
            GoalType.WEIGHT_LOSS: "weight loss",
            GoalType.MUSCLE_GAIN: "muscle gain",
            GoalType.MAINTAIN: "weight maintenance"
        }.get(user.profile.goal if user.profile else GoalType.MAINTAIN, "general health")
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a nutrition coach. Provide a helpful daily tip for someone with {goal_context} goals based on their recent meals. Keep it under 80 words and make it actionable."
                },
                {
                    "role": "user",
                    "content": f"Recent meals: {[meal.get('description', 'meal') for meal in recent_meals[:3]]}"
                }
            ],
            max_tokens=120
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception:
        return "Focus on eating balanced meals with protein, healthy carbs, and vegetables to support your goals!"

async def answer_nutrition_question(question: str, user: User) -> str:
    try:
        goal_context = {
            GoalType.WEIGHT_LOSS: "weight loss",
            GoalType.MUSCLE_GAIN: "muscle gain", 
            GoalType.MAINTAIN: "weight maintenance"
        }.get(user.profile.goal if user.profile else GoalType.MAINTAIN, "general health")
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a nutrition expert helping someone with {goal_context} goals. Provide helpful, evidence-based answers. Keep responses under 200 words and include practical advice."
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            max_tokens=250
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception:
        return "I'm having trouble processing your question right now. Please try again or consult with a nutrition professional for personalized advice."

async def suggest_meal_improvements(meal_data: Dict[str, Any], user: User) -> str:
    try:
        goal_context = {
            GoalType.WEIGHT_LOSS: "weight loss",
            GoalType.MUSCLE_GAIN: "muscle gain",
            GoalType.MAINTAIN: "weight maintenance"
        }.get(user.profile.goal if user.profile else GoalType.MAINTAIN, "general health")
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"Suggest 2-3 simple improvements to this meal for someone with {goal_context} goals. Focus on practical swaps or additions. Keep under 100 words."
                },
                {
                    "role": "user",
                    "content": f"Meal: {meal_data.get('description', 'Unknown')} - {meal_data.get('calories', 0)} cal, {meal_data.get('protein', 0)}g protein, {meal_data.get('carbs', 0)}g carbs, {meal_data.get('fat', 0)}g fat"
                }
            ],
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception:
        return "Consider adding more vegetables, lean protein, or healthy fats to make this meal more balanced!"