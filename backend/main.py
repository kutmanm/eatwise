from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.users.routes import router as users_router
from api.meals.routes import router as meals_router
from api.progress.routes import router as progress_router
from api.ai.routes import router as ai_router
from api.subsciption.routes import router as subscription_router
from utils.config import settings
from utils.helpers import run_migrations
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EatWise API",
    description="AI-powered diet tracking and nutrition coaching API",
    version="1.0.0"
)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(meals_router)
app.include_router(progress_router)
app.include_router(ai_router)
app.include_router(subscription_router)

@app.get("/")
def read_root():
    return {"message": "EatWise API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
