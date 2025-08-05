from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.feedback import Feedback
from schemas.feedback import FeedbackCreate, FeedbackResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db)
):
    """
    Create new feedback entry
    """
    try:
        # Create new feedback
        db_feedback = Feedback(
            email=feedback_data.email,
            feedback_text=feedback_data.feedback
        )
        
        db.add(db_feedback)
        db.commit()
        db.refresh(db_feedback)
        
        return FeedbackResponse(
            id=db_feedback.id,
            email=db_feedback.email,
            feedback=db_feedback.feedback_text,
            created_at=db_feedback.created_at,
            message="Feedback submitted successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save feedback: {str(e)}"
        )