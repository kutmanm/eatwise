# Backend Implementation Tasks

## Task 1: Project Structure & Dependencies

### Objective
Set up the complete backend project structure according to cursor rules and install all required dependencies.

### Implementation Steps

1. **Create Directory Structure**
```
backend/
├── main.py
├── requirements.txt
├── api/
│   ├── __init__.py
│   ├── meals/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── auth/
│   │   ├── __init__.py
│   │   └── routes.py
│   └── users/
│       ├── __init__.py
│       └── routes.py
├── services/
│   ├── __init__.py
│   ├── ai_service.py
│   ├── meal_service.py
│   ├── user_service.py
│   └── auth_service.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── meal.py
│   └── database.py
├── schemas/
│   ├── __init__.py
│   ├── user.py
│   ├── meal.py
│   └── auth.py
└── utils/
    ├── __init__.py
    ├── config.py
    └── helpers.py
```

2. **Install Dependencies**
```python
# requirements.txt
fastapi[all]==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
supabase==2.0.3
openai==1.3.5
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
pillow==10.1.0
```

### AI Agent Instructions
- Create all directories and __init__.py files
- Generate requirements.txt with exact versions
- Ensure folder structure matches cursor rules exactly
- No additional files or modifications

---

## Task 2: Database Models & Configuration

### Objective
Create SQLAlchemy 2.0 models with proper type hints and database configuration.

### Implementation Steps

1. **Database Configuration** (`models/database.py`)
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from utils.config import settings

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

2. **User Model** (`models/user.py`)
```python
from sqlalchemy import Column, String, DateTime, Float, Integer, Text
from sqlalchemy.sql import func
from .database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id: str = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    supabase_id: str = Column(String, unique=True, nullable=False)
    email: str = Column(String, unique=True, nullable=False)
    full_name: str = Column(String, nullable=True)
    age: int = Column(Integer, nullable=True)
    weight: float = Column(Float, nullable=True)
    height: float = Column(Float, nullable=True)
    activity_level: str = Column(String, nullable=True)
    goal_calories: float = Column(Float, nullable=True)
    goal_protein: float = Column(Float, nullable=True)
    goal_fat: float = Column(Float, nullable=True)
    goal_carbs: float = Column(Float, nullable=True)
    dietary_preferences: str = Column(Text, nullable=True)
    created_at: DateTime = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: DateTime = Column(DateTime(timezone=True), onupdate=func.now())
```

3. **Meal Model** (`models/meal.py`)
```python
from sqlalchemy import Column, String, DateTime, Float, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import uuid

class Meal(Base):
    __tablename__ = "meals"
    
    id: str = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: str = Column(String, ForeignKey("users.id"), nullable=False)
    description: str = Column(Text, nullable=False)
    meal_type: str = Column(String, nullable=False)  # breakfast, lunch, dinner, snack
    image_url: str = Column(String, nullable=True)
    calories: float = Column(Float, nullable=False)
    protein: float = Column(Float, nullable=False)
    fat: float = Column(Float, nullable=False)
    carbs: float = Column(Float, nullable=False)
    fiber: float = Column(Float, nullable=True)
    sugar: float = Column(Float, nullable=True)
    sodium: float = Column(Float, nullable=True)
    ai_processed: bool = Column(String, default=True)
    manually_adjusted: bool = Column(String, default=False)
    logged_at: DateTime = Column(DateTime(timezone=True), server_default=func.now())
    created_at: DateTime = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="meals")
```

### AI Agent Instructions
- Use SQLAlchemy 2.0 syntax with type hints
- Follow declarative ORM style as specified in cursor rules
- Include proper relationships and foreign keys
- Add timezone-aware datetime fields

---

## Task 3: Pydantic Schemas

### Objective
Create type-safe Pydantic schemas for request/response validation.

### Implementation Steps

1. **User Schemas** (`schemas/user.py`)
```python
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    activity_level: Optional[str] = None
    goal_calories: Optional[float] = None
    goal_protein: Optional[float] = None
    goal_fat: Optional[float] = None
    goal_carbs: Optional[float] = None
    dietary_preferences: Optional[str] = None

class UserCreate(UserBase):
    supabase_id: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    activity_level: Optional[str] = None
    goal_calories: Optional[float] = None
    goal_protein: Optional[float] = None
    goal_fat: Optional[float] = None
    goal_carbs: Optional[float] = None
    dietary_preferences: Optional[str] = None

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
```

2. **Meal Schemas** (`schemas/meal.py`)
```python
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class MealBase(BaseModel):
    description: str
    meal_type: str
    calories: float
    protein: float
    fat: float
    carbs: float
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    sodium: Optional[float] = None

class MealCreate(BaseModel):
    description: str
    meal_type: str
    image_url: Optional[str] = None

class MealCreateFromAI(MealBase):
    ai_processed: bool = True
    manually_adjusted: bool = False

class MealUpdate(BaseModel):
    description: Optional[str] = None
    meal_type: Optional[str] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    sodium: Optional[float] = None
    manually_adjusted: bool = True

class MealResponse(MealBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    image_url: Optional[str] = None
    ai_processed: bool
    manually_adjusted: bool
    logged_at: datetime
    created_at: datetime
```

### AI Agent Instructions
- Use Pydantic v2 syntax with ConfigDict
- Include proper type hints and Optional fields
- Follow the separation between Create, Update, and Response schemas
- Enable from_attributes for ORM compatibility

---

## Task 4: Configuration & Environment Setup

### Objective
Create centralized configuration management with Pydantic Settings.

### Implementation Steps

1. **Configuration** (`utils/config.py`)
```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # FastAPI
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

2. **Environment File Template** (`.env.example`)
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/eatwise

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# FastAPI
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]

# Environment
ENVIRONMENT=development
```

### AI Agent Instructions
- Use Pydantic Settings for type-safe configuration
- Include all required environment variables
- Create .env.example but not .env file
- Follow cursor rules for no logs or prints

---

## Task 5: Authentication Service

### Objective
Implement Supabase authentication integration with FastAPI dependencies.

### Implementation Steps

1. **Auth Service** (`services/auth_service.py`)
```python
from supabase import create_client, Client
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.config import settings
import jwt

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SUPABASE_ANON_KEY,
            algorithms=["HS256"],
            options={"verify_signature": False}
        )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

async def get_current_user(token_data: dict = Depends(verify_token)) -> str:
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return user_id

class AuthService:
    @staticmethod
    async def sign_up(email: str, password: str) -> dict:
        response = supabase.auth.sign_up({"email": email, "password": password})
        if response.user is None:
            raise HTTPException(status_code=400, detail="Failed to create user")
        return {"user": response.user, "session": response.session}
    
    @staticmethod
    async def sign_in(email: str, password: str) -> dict:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"user": response.user, "session": response.session}
    
    @staticmethod
    async def sign_out(token: str) -> bool:
        supabase.auth.sign_out()
        return True
```

2. **Auth Schemas** (`schemas/auth.py`)
```python
from pydantic import BaseModel, EmailStr

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
```

### AI Agent Instructions
- Use FastAPI Depends for dependency injection
- Implement proper JWT token verification
- Handle Supabase auth responses correctly
- Include error handling with appropriate HTTP status codes

---

## Task 6: AI Service for Nutrition Analysis

### Objective
Implement OpenAI GPT-4o integration for text and image-based nutrition analysis.

### Implementation Steps

1. **AI Service** (`services/ai_service.py`)
```python
from openai import AsyncOpenAI
from utils.config import settings
from typing import Dict, Any
import json
import base64

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class AIService:
    @staticmethod
    async def analyze_meal_text(description: str, meal_type: str) -> Dict[str, float]:
        prompt = f"""
        Given this meal description for {meal_type}: "{description}"
        
        Estimate the nutritional content and return ONLY a JSON object with these exact keys:
        {{
            "calories": float,
            "protein": float,
            "fat": float,
            "carbs": float,
            "fiber": float,
            "sugar": float,
            "sodium": float
        }}
        
        Provide realistic estimates in grams for macros and milligrams for sodium.
        """
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        try:
            nutrition_data = json.loads(response.choices[0].message.content)
            return nutrition_data
        except json.JSONDecodeError:
            raise ValueError("Failed to parse nutrition data from AI response")
    
    @staticmethod
    async def analyze_meal_image(image_base64: str, meal_type: str) -> Dict[str, float]:
        prompt = f"""
        Analyze this {meal_type} image and estimate the nutritional content.
        
        Return ONLY a JSON object with these exact keys:
        {{
            "calories": float,
            "protein": float,
            "fat": float,
            "carbs": float,
            "fiber": float,
            "sugar": float,
            "sodium": float,
            "description": "string describing the meal"
        }}
        
        Provide realistic estimates based on visible portion sizes.
        """
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                        }
                    ]
                }
            ],
            temperature=0.3
        )
        
        try:
            nutrition_data = json.loads(response.choices[0].message.content)
            return nutrition_data
        except json.JSONDecodeError:
            raise ValueError("Failed to parse nutrition data from AI response")
    
    @staticmethod
    async def generate_coaching_advice(daily_intake: Dict[str, float], goals: Dict[str, float]) -> str:
        prompt = f"""
        Based on today's intake vs goals:
        
        Intake: {daily_intake}
        Goals: {goals}
        
        Provide 1-2 brief, actionable suggestions for tomorrow to help reach nutritional goals.
        Keep response under 200 characters and focus on practical improvements.
        """
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
```

### AI Agent Instructions
- Use async OpenAI client for all API calls
- Include proper error handling for API failures
- Follow exact JSON schema for nutrition data
- Keep coaching advice concise and actionable

---

## Task 7: Business Logic Services

### Objective
Implement core business logic services for users and meals.

### Implementation Steps

1. **User Service** (`services/user_service.py`)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from schemas.user import UserCreate, UserUpdate, UserResponse
from typing import Optional

class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        db_user = User(**user_data.model_dump())
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user
    
    @staticmethod
    async def get_user_by_supabase_id(db: AsyncSession, supabase_id: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.supabase_id == supabase_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_user(db: AsyncSession, user_id: str, user_data: UserUpdate) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None
        
        for field, value in user_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    async def delete_user(db: AsyncSession, user_id: str) -> bool:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return False
        
        await db.delete(user)
        await db.commit()
        return True
```

2. **Meal Service** (`services/meal_service.py`)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from models.meal import Meal
from schemas.meal import MealCreate, MealCreateFromAI, MealUpdate, MealResponse
from services.ai_service import AIService
from datetime import datetime, date
from typing import List, Optional, Dict

class MealService:
    @staticmethod
    async def create_meal_from_text(
        db: AsyncSession, 
        user_id: str, 
        meal_data: MealCreate
    ) -> Meal:
        # Get AI analysis
        nutrition_data = await AIService.analyze_meal_text(
            meal_data.description, 
            meal_data.meal_type
        )
        
        # Create meal with AI data
        meal_create_data = MealCreateFromAI(
            description=meal_data.description,
            meal_type=meal_data.meal_type,
            **nutrition_data
        )
        
        db_meal = Meal(
            user_id=user_id,
            **meal_create_data.model_dump()
        )
        db.add(db_meal)
        await db.commit()
        await db.refresh(db_meal)
        return db_meal
    
    @staticmethod
    async def create_meal_from_image(
        db: AsyncSession,
        user_id: str,
        meal_type: str,
        image_base64: str,
        image_url: str
    ) -> Meal:
        # Get AI analysis
        nutrition_data = await AIService.analyze_meal_image(image_base64, meal_type)
        
        # Extract description and nutrition
        description = nutrition_data.pop("description", "Meal from image")
        
        # Create meal with AI data
        meal_create_data = MealCreateFromAI(
            description=description,
            meal_type=meal_type,
            **nutrition_data
        )
        
        db_meal = Meal(
            user_id=user_id,
            image_url=image_url,
            **meal_create_data.model_dump()
        )
        db.add(db_meal)
        await db.commit()
        await db.refresh(db_meal)
        return db_meal
    
    @staticmethod
    async def get_user_meals(
        db: AsyncSession, 
        user_id: str, 
        limit: int = 50,
        offset: int = 0
    ) -> List[Meal]:
        result = await db.execute(
            select(Meal)
            .where(Meal.user_id == user_id)
            .order_by(Meal.logged_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_daily_nutrition(db: AsyncSession, user_id: str, date: date) -> Dict[str, float]:
        start_date = datetime.combine(date, datetime.min.time())
        end_date = datetime.combine(date, datetime.max.time())
        
        result = await db.execute(
            select(
                func.sum(Meal.calories).label("calories"),
                func.sum(Meal.protein).label("protein"),
                func.sum(Meal.fat).label("fat"),
                func.sum(Meal.carbs).label("carbs"),
                func.sum(Meal.fiber).label("fiber"),
                func.sum(Meal.sugar).label("sugar"),
                func.sum(Meal.sodium).label("sodium")
            )
            .where(and_(
                Meal.user_id == user_id,
                Meal.logged_at >= start_date,
                Meal.logged_at <= end_date
            ))
        )
        
        row = result.first()
        return {
            "calories": float(row.calories or 0),
            "protein": float(row.protein or 0),
            "fat": float(row.fat or 0),
            "carbs": float(row.carbs or 0),
            "fiber": float(row.fiber or 0),
            "sugar": float(row.sugar or 0),
            "sodium": float(row.sodium or 0)
        }
    
    @staticmethod
    async def update_meal(
        db: AsyncSession, 
        meal_id: str, 
        user_id: str,
        meal_data: MealUpdate
    ) -> Optional[Meal]:
        result = await db.execute(
            select(Meal).where(and_(Meal.id == meal_id, Meal.user_id == user_id))
        )
        meal = result.scalar_one_or_none()
        if not meal:
            return None
        
        for field, value in meal_data.model_dump(exclude_unset=True).items():
            setattr(meal, field, value)
        
        await db.commit()
        await db.refresh(meal)
        return meal
    
    @staticmethod
    async def delete_meal(db: AsyncSession, meal_id: str, user_id: str) -> bool:
        result = await db.execute(
            select(Meal).where(and_(Meal.id == meal_id, Meal.user_id == user_id))
        )
        meal = result.scalar_one_or_none()
        if not meal:
            return False
        
        await db.delete(meal)
        await db.commit()
        return True
```

### AI Agent Instructions
- Use async SQLAlchemy with proper session management
- Include error handling for database operations
- Follow service layer pattern with business logic separation
- Integrate AI service for nutrition analysis

---

## Task 8: API Routes Implementation

### Objective
Create FastAPI route handlers that call services and handle HTTP requests/responses.

### Implementation Steps

1. **Auth Routes** (`api/auth/routes.py`)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from services.auth_service import AuthService, get_current_user
from services.user_service import UserService
from schemas.auth import SignUpRequest, SignInRequest, AuthResponse
from schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse)
async def signup(
    request: SignUpRequest,
    db: AsyncSession = Depends(get_db)
):
    # Create auth user
    auth_response = await AuthService.sign_up(request.email, request.password)
    
    # Create user profile
    user_data = UserCreate(
        supabase_id=auth_response["user"].id,
        email=request.email
    )
    await UserService.create_user(db, user_data)
    
    return AuthResponse(
        access_token=auth_response["session"].access_token,
        user_id=auth_response["user"].id,
        email=auth_response["user"].email
    )

@router.post("/signin", response_model=AuthResponse)
async def signin(request: SignInRequest):
    auth_response = await AuthService.sign_in(request.email, request.password)
    
    return AuthResponse(
        access_token=auth_response["session"].access_token,
        user_id=auth_response["user"].id,
        email=auth_response["user"].email
    )

@router.post("/signout")
async def signout(current_user: str = Depends(get_current_user)):
    await AuthService.sign_out("")
    return {"message": "Successfully signed out"}
```

2. **User Routes** (`api/users/routes.py`)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from services.auth_service import get_current_user
from services.user_service import UserService
from schemas.user import UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await UserService.update_user(db, user.id, user_data)
    return updated_user

@router.delete("/me")
async def delete_current_user_profile(
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    success = await UserService.delete_user(db, user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete user")
    
    return {"message": "User deleted successfully"}
```

3. **Meal Routes** (`api/meals/routes.py`)
```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from services.auth_service import get_current_user
from services.user_service import UserService
from services.meal_service import MealService
from services.ai_service import AIService
from schemas.meal import MealCreate, MealUpdate, MealResponse
from datetime import date
from typing import List
import base64

router = APIRouter(prefix="/meals", tags=["Meals"])

@router.post("/text", response_model=MealResponse)
async def create_meal_from_text(
    meal_data: MealCreate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    meal = await MealService.create_meal_from_text(db, user.id, meal_data)
    return meal

@router.post("/image", response_model=MealResponse)
async def create_meal_from_image(
    meal_type: str = Form(...),
    image: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert image to base64
    image_data = await image.read()
    image_base64 = base64.b64encode(image_data).decode()
    
    # Store image (simplified - would use Supabase Storage in production)
    image_url = f"/uploads/{image.filename}"
    
    meal = await MealService.create_meal_from_image(
        db, user.id, meal_type, image_base64, image_url
    )
    return meal

@router.get("/", response_model=List[MealResponse])
async def get_user_meals(
    limit: int = 50,
    offset: int = 0,
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    meals = await MealService.get_user_meals(db, user.id, limit, offset)
    return meals

@router.get("/daily-nutrition")
async def get_daily_nutrition(
    date: date,
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    nutrition = await MealService.get_daily_nutrition(db, user.id, date)
    return nutrition

@router.get("/coaching")
async def get_coaching_advice(
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get today's nutrition
    today = date.today()
    daily_intake = await MealService.get_daily_nutrition(db, user.id, today)
    
    # Get user goals
    goals = {
        "calories": user.goal_calories or 2000,
        "protein": user.goal_protein or 150,
        "fat": user.goal_fat or 70,
        "carbs": user.goal_carbs or 250
    }
    
    coaching_advice = await AIService.generate_coaching_advice(daily_intake, goals)
    
    return {
        "advice": coaching_advice,
        "daily_intake": daily_intake,
        "goals": goals
    }

@router.put("/{meal_id}", response_model=MealResponse)
async def update_meal(
    meal_id: str,
    meal_data: MealUpdate,
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    meal = await MealService.update_meal(db, meal_id, user.id, meal_data)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    return meal

@router.delete("/{meal_id}")
async def delete_meal(
    meal_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user = await UserService.get_user_by_supabase_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    success = await MealService.delete_meal(db, meal_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    return {"message": "Meal deleted successfully"}
```

### AI Agent Instructions
- Use FastAPI dependency injection for auth and database
- Include proper HTTP status codes and error handling
- Follow RESTful API conventions
- Integrate with service layer only (no direct database access)

---

## Task 9: Main Application Setup

### Objective
Configure the main FastAPI application with middleware, CORS, and route registration.

### Implementation Steps

1. **Main Application** (`main.py`)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth.routes import router as auth_router
from api.users.routes import router as users_router
from api.meals.routes import router as meals_router
from utils.config import settings

app = FastAPI(
    title="EatWise API",
    description="Meal tracking and nutrition analysis API",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(meals_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "EatWise API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

2. **Database Migration Setup** (`alembic.ini`)
```ini
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = driver://user:pass@localhost/dbname

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### AI Agent Instructions
- Configure FastAPI with proper middleware and CORS
- Include all route modules with consistent prefixing
- Add health check endpoint for monitoring
- Set up Alembic for database migrations

---

## Task 10: Deployment & Testing Setup

### Objective
Prepare the application for deployment on Render with proper configuration.

### Implementation Steps

1. **Docker Configuration** (`Dockerfile`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Render Configuration** (`render.yaml`)
```yaml
services:
  - type: web
    name: eatwise-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

3. **Development Script** (`run_dev.py`)
```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["./"]
    )
```

### AI Agent Instructions
- Create deployment-ready configuration files
- Include development utilities for local testing
- Ensure proper environment variable handling
- Follow Render deployment best practices

## Validation Checklist

After implementing all tasks, verify:
- [ ] All directory structure matches cursor rules
- [ ] FastAPI app starts without errors
- [ ] Database models create tables successfully
- [ ] Authentication endpoints work with Supabase
- [ ] AI services integrate with OpenAI API
- [ ] Meal creation works for both text and images
- [ ] All endpoints return proper HTTP status codes
- [ ] CORS is configured for frontend integration