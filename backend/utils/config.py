from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    supabase_url: str
    supabase_key: str
    supabase_jwt_secret: str
    supabase_service_role_key: str
    supabase_anon_key: str
    supabase_storage_bucket: str
    openai_api_key: str
    stripe_secret_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str
    app_environment: str = "development"
    cors_origins: str = "http://localhost:3000"
    frontend_base_url: str = "http://localhost:3000"
    at_rest_encryption_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()