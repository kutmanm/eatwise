from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from utils.config import settings
from schemas.meal import PhotoAnalysisResponse, ChatLogResponse
from models.user import User, GoalType
import json
import base64
import re

# Initialize OpenAI client with new v1.x API
client = AsyncOpenAI(api_key=settings.openai_api_key)

async def analyze_meal_photo(image_url: str) -> PhotoAnalysisResponse:
    try:
        # Check if the image is a base64 string
        if image_url.startswith('data:image'):
            # Extract the base64 part after the comma
            base64_match = re.match(r'data:image/[^;]+;base64,(.+)', image_url)
            if base64_match:
                base64_image = base64_match.group(1)
            else:
                raise ValueError("Invalid base64 image format")
        else:
            # Convert URL to base64 (this branch won't be used anymore)
            try:
                import httpx
                async with httpx.AsyncClient() as http_client:
                    response = await http_client.get(image_url)
                    response.raise_for_status()
                    image_data = response.content
                    base64_image = base64.b64encode(image_data).decode('utf-8')
            except Exception as e:
                print(f"Error downloading image: {e}")
                raise

        response = await client.chat.completions.create(
    model="gpt-4o-mini",  # still using the mini, but you could bump to "gpt-4o" for even stronger vision
    temperature=0.0,       # deterministic output
    top_p=1.0,             # full nucleus sampling
    max_tokens=500,
    messages=[
        # 1) Send the image up‐front, so the model “sees” it first
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        },
        # 2) Strong system instruction to emphasize deep visual analysis
        {
            "role": "system",
            "content": (
                "You are a nutrition expert with advanced vision capabilities. "
                "Examine every visible detail of the meal photo—portion sizes, textures, cooking method, garnish, even plate size—to "
                "produce the most accurate nutrition estimate possible. "
                "Return ONLY a JSON object with these fields (all in grams except calories): "
                "description, calories, protein, carbs, fat, fiber, water, and confidence (0-1)."
            )
        },
        # 3) A brief user prompt to trigger the analysis
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Please analyze this meal and output ONLY valid JSON."
                }
            ]
        }
    ]
)

        
        # Extract JSON from the response
        response_text = response.choices[0].message.content
        # Find the JSON part (between { and })
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
        else:
            raise ValueError("No valid JSON found in response")

        return PhotoAnalysisResponse(**result)
    
    except Exception as e:
        print(f"Error analyzing photo: {e}")  # For debugging
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
        response = await client.chat.completions.create(
            model="gpt-4o",  # Full model for best parsing and reasoning
            temperature=0.0,  # Deterministic output
            top_p=1.0,
            max_tokens=400,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional nutrition analyst. "
                        "Given a natural language meal description, your task is to extract and interpret the food items, estimate their quantities, "
                        "and compute an accurate nutritional profile. "
                        "Only return a valid JSON object with the following fields:\n"
                        "- parsed_description (string)\n"
                        "- calories (float)\n"
                        "- protein (float)\n"
                        "- carbs (float)\n"
                        "- fat (float)\n"
                        "- fiber (float)\n"
                        "- water (float)\n"
                        "- confidence (float from 0.0 to 1.0)\n\n"
                        "Units: grams for all except calories.\n"
                        "Be conservative with confidence scores if information is ambiguous or portion size is unclear."
                    )
                },
                {
                    "role": "user",
                    "content": f"Estimate the nutritional values for this meal: {description}. Only return valid JSON."
                }
            ]
        )

        # Some model responses may include prose around the JSON. Extract the JSON block safely.
        response_text = response.choices[0].message.content
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
            return ChatLogResponse(**result)
        else:
            raise ValueError("No valid JSON found in response")
    
    except Exception as e:
        print(f"Error parsing meal text: {e}")  # For debugging
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
        
        response = await client.chat.completions.create(
    model="gpt-4o",
    temperature=0.7,  # Allow a bit of creativity and tone variation
    max_tokens=150,
    messages=[
        {
            "role": "system",
            "content": (
                f"You are a professional nutrition coach. Based on the user's goals ({goal_context}), "
                "analyze the current meal and give short, encouraging feedback. "
                "Mention how it contributes to their goal, and include one realistic tip if applicable "
                "(e.g., balance, hydration, portion control, etc.). "
                "Keep tone motivational, stay under 100 words, and avoid shaming or negative framing."
            )
        },
        {
            "role": "user",
            "content": (
                f"Meal: {meal_data.get('description', 'Unknown meal')} — "
                f"{meal_data.get('calories', 0)} kcal, {meal_data.get('protein', 0)}g protein, "
                f"{meal_data.get('carbs', 0)}g carbs, {meal_data.get('fat', 0)}g fat.\n"
                f"Daily so far: {daily_totals.get('calories', 0)} kcal, "
                f"{daily_totals.get('protein', 0)}g protein.\n"
                f"Goal: {goal_context}."
            )
        }
    ]
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
        
        response = await client.chat.completions.create(
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
        
        response = await client.chat.completions.create(
    model="gpt-4o",
    temperature=0.6,  # Mild creativity for varied, natural tips
    max_tokens=120,
    messages=[
        {
            "role": "system",
            "content": (
                f"You are a certified nutrition coach. Based on a person's recent meals and their goal ({goal_context}), "
                "give one short, specific, and actionable tip to improve their nutrition. "
                "The tip should be practical and goal-aligned (e.g., increase fiber, hydrate, improve protein timing, balance macros, reduce refined carbs, etc.). "
                "Limit to 80 words. Avoid general advice like 'eat healthier' — be specific and helpful."
            )
        },
        {
            "role": "user",
            "content": (
                "Recent meals:\n" +
                "\n".join([f"- {meal.get('description', 'meal')}" for meal in recent_meals[:3]])
            )
        }
    ]
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
        
        response = await client.chat.completions.create(
    model="gpt-4o",
    temperature=0.5,  # Balanced: practical but still a bit flexible
    max_tokens=150,
    messages=[
        {
            "role": "system",
            "content": (
                f"You are a certified nutritionist. Based on the given meal and the user's goal ({goal_context}), "
                "suggest 2–3 specific, realistic improvements. Focus on **practical swaps, additions, or minor adjustments** — not full overhauls. "
                "Tailor suggestions to the nutritional breakdown. Keep total response under 100 words. "
                "Avoid generic advice; be concrete (e.g., add 1 boiled egg, swap rice for quinoa, reduce added oil)."
            )
        },
        {
            "role": "user",
            "content": (
                f"Meal: {meal_data.get('description', 'Unknown')} — "
                f"{meal_data.get('calories', 0)} kcal, {meal_data.get('protein', 0)}g protein, "
                f"{meal_data.get('carbs', 0)}g carbs, {meal_data.get('fat', 0)}g fat."
            )
        }
    ]
)

        
        return response.choices[0].message.content.strip()
    
    except Exception:
        return "Consider adding more vegetables, lean protein, or healthy fats to make this meal more balanced!"