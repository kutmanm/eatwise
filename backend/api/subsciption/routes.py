from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from schemas.user import User as UserSchema, UserUpdate, UserProfile, UserProfileCreate, UserProfileUpdate, Subscription
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/subscription", tags=["stripe"])
