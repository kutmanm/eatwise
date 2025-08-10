from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.users.routes import router as users_router
from api.meals.routes import router as meals_router
from api.progress.routes import router as progress_router
from api.ai.routes import router as ai_router
from api.symptoms.routes import router as symptoms_router
from api.diet_plans.routes import router as diet_plans_router
from api.onboarding.routes import router as onboarding_router
try:
    from api.subsciption.routes import router as subscription_router
except ImportError:
    # Create a placeholder router if module not found
    import logging
    from fastapi import APIRouter
    logger = logging.getLogger(__name__)
    logger.warning("Could not import subscription router, using placeholder")
    subscription_router = APIRouter(prefix="/subscription", tags=["subscription"])
from api.weight_logs.routes import router as weight_logs_router
from utils.config import settings
from utils.helpers import run_migrations
from utils.middleware import RequestLoggingMiddleware, ErrorContextMiddleware
import logging
from datetime import datetime, timedelta
import asyncio
from sqlalchemy.orm import Session as SyncSession
from models.database import SessionLocal
from models.user import User
from models.diet_plan import WeeklySummary
from services.meal_service import get_weekly_progress
from services.symptom_service import get_symptom_summary_stats

# Set up comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log') if settings.app_environment != 'development' else logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EatWise API",
    description="AI-powered diet tracking and nutrition coaching API",
    version="1.0.0"
)

# Configure CORS from settings
allowed_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(ErrorContextMiddleware)

# Run database migrations on startup
@app.on_event("startup")
async def startup_event():
    try:
        logger.info("Starting database migrations...")
        run_migrations()
        logger.info("Application startup completed successfully")
        # Start background scheduler
        asyncio.create_task(_weekly_summary_scheduler())
    except Exception as e:
        logger.error(f"Database migration failed during startup: {e}")
        logger.warning("Application will continue to run, but database may not be properly initialized")
        logger.warning("Please check your DATABASE_URL and ensure the database is accessible")

app.include_router(users_router)
app.include_router(meals_router)
app.include_router(progress_router)
app.include_router(ai_router)
app.include_router(symptoms_router)
app.include_router(diet_plans_router)
app.include_router(onboarding_router)
app.include_router(subscription_router)
app.include_router(weight_logs_router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to EatWise API", "cors_enabled": True}

@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working!", "timestamp": "2025-08-06T00:36:00", "version": "1.0.0"}

@app.post("/test-feedback")
async def test_feedback_simple(request_data: dict):
    """Simple test endpoint for feedback without authentication"""
    return {"message": "Test feedback received", "data": request_data}

@app.post("/test-user-feedback")
async def test_user_feedback_simple(request_data: dict):
    """Test endpoint for user feedback schema validation"""
    from schemas.user import UserFeedbackCreate
    try:
        # Test schema validation
        feedback_data = UserFeedbackCreate(**request_data)
        return {
            "message": "User feedback schema validation successful", 
            "validated_data": feedback_data.model_dump()
        }
    except Exception as e:
        return {
            "message": "User feedback schema validation failed",
            "error": str(e)
        }

@app.get("/health")
def health_check():
    return {"status": "healthy"}


async def _weekly_summary_scheduler():
    """Run daily to compute last week's summaries if missing."""
    while True:
        try:
            # Sleep until 03:00 UTC
            now = datetime.utcnow()
            target = now.replace(hour=3, minute=0, second=0, microsecond=0)
            if target <= now:
                target += timedelta(days=1)
            await asyncio.sleep((target - now).total_seconds())

            db: SyncSession = SessionLocal()
            try:
                users = db.query(User).all()
                # compute Monday of current week - 7 days (last week)
                today = datetime.utcnow().date()
                monday_this_week = today - timedelta(days=today.weekday())
                week_start = monday_this_week - timedelta(days=7)
                for user in users:
                    exists = db.query(WeeklySummary).filter(
                        WeeklySummary.user_id == user.id,
                        WeeklySummary.week_start == week_start
                    ).first()
                    if exists:
                        continue
                    # Run computations
                    weekly = await get_weekly_progress(user, week_start, db)
                    symptom = await get_symptom_summary_stats(user, db, date_range_days=7)
                    computed = {
                        "week_start": week_start.isoformat(),
                        "nutrition": {
                            "avg_calories": weekly.avg_calories,
                            "avg_protein": weekly.avg_protein,
                            "avg_carbs": weekly.avg_carbs,
                            "avg_fat": weekly.avg_fat,
                        },
                        "symptoms": symptom,
                    }
                    db.add(WeeklySummary(user_id=user.id, week_start=week_start, summary=computed))
                    db.commit()
            finally:
                db.close()
        except Exception:
            logger.exception("Weekly summary scheduler failure")
            await asyncio.sleep(3600)
