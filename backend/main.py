from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.users.routes import router as users_router
from api.meals.routes import router as meals_router
from api.progress.routes import router as progress_router
from api.ai.routes import router as ai_router
from api.subsciption.routes import router as subscription_router
from api.weight_logs.routes import router as weight_logs_router
from utils.config import settings
from utils.helpers import run_migrations
from utils.middleware import RequestLoggingMiddleware, ErrorContextMiddleware
import logging

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

# Configure CORS - Updated to be more permissive
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
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
    except Exception as e:
        logger.error(f"Database migration failed during startup: {e}")
        logger.warning("Application will continue to run, but database may not be properly initialized")
        logger.warning("Please check your DATABASE_URL and ensure the database is accessible")

app.include_router(users_router)
app.include_router(meals_router)
app.include_router(progress_router)
app.include_router(ai_router)
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
