from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date
from models.database import get_db
from models.user import User
from schemas.meal import (
    Meal, MealCreate, MealUpdate, PhotoAnalysisRequest, PhotoAnalysisResponse,
    ChatLogRequest, ChatLogResponse
)
from services.auth_service import get_current_user
from services.meal_service import (
    create_meal, get_user_meals, get_meal_by_id, update_meal, delete_meal,
    analyze_photo, parse_chat_log, search_meals
)

router = APIRouter(prefix="/api/meals", tags=["meals"])

@router.post("", response_model=Meal)
async def create_new_meal(
    meal_data: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = await create_meal(current_user, meal_data, db)
    return meal

@router.get("", response_model=List[Meal])
async def get_meals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Convert date strings to datetime objects if provided
    start_datetime = None
    end_datetime = None
    
    if start_date:
        try:
            start_datetime = datetime.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid start_date format. Use YYYY-MM-DD"
            )
    
    if end_date:
        try:
            end_datetime = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid end_date format. Use YYYY-MM-DD"
            )
    
    meals = await get_user_meals(current_user, db, skip, limit, start_datetime, end_datetime)
    return meals

@router.get("/search", response_model=List[Meal])
async def search_user_meals(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meals = await search_meals(current_user, q, db, limit)
    return meals

@router.get("/{meal_id}", response_model=Meal)
async def get_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = await get_meal_by_id(current_user, meal_id, db)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return meal

@router.put("/{meal_id}", response_model=Meal)
async def update_existing_meal(
    meal_id: int,
    meal_data: MealUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = await update_meal(current_user, meal_id, meal_data, db)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return meal

@router.delete("/{meal_id}")
async def delete_existing_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = await delete_meal(current_user, meal_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return {"message": "Meal deleted successfully"}

@router.post("/photo-analysis", response_model=PhotoAnalysisResponse)
async def analyze_meal_photo(
    photo_request: PhotoAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = await analyze_photo(current_user, photo_request, db)
    return analysis

@router.post("/chat-log", response_model=ChatLogResponse)
async def parse_meal_description(
    chat_request: ChatLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = await parse_chat_log(current_user, chat_request, db)
    return analysis