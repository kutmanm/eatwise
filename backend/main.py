from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.users.routes import router as users_router
from api.meals.routes import router as meals_router
from api.progress.routes import router as progress_router
from api.ai.routes import router as ai_router
from api.feedback.routes import router as feedback_router
from utils.config import settings
from models.database import create_tables

app = FastAPI(
    title="EatWise API",
    description="AI-powered diet tracking and nutrition coaching API",
    version="1.0.0"
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

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
app.include_router(feedback_router)

@app.get("/")
def read_root():
    return {"message": "EatWise API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
