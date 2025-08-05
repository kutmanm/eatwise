from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class FeedbackCreate(BaseModel):
    email: str
    feedback: str

class FeedbackResponse(BaseModel):
    id: int
    email: str
    feedback: str
    created_at: datetime
    message: Optional[str] = None

    class Config:
        from_attributes = True