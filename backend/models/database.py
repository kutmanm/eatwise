from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .user import Base
from .meal import Meal

# Import settings to get database URL
try:
    from utils.config import settings
    DATABASE_URL = settings.database_url
except ImportError:
    # Fallback to environment variable if settings not available
    import os
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/eatwise")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Tables are now managed by Alembic migrations