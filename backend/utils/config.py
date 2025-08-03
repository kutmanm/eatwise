from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    supabase_url: str
    supabase_key: str
    supabase_jwt_secret: str
    openai_api_key: str
    stripe_secret_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str
    app_environment: str = "development"
    cors_origins: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()