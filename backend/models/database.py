from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .user import Base
from .meal import Meal
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

def create_tables():
    Base.metadata.create_all(bind=engine)