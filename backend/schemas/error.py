from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ErrorCode(str, Enum):
    """Standard error codes for the API"""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"

class ValidationError(BaseModel):
    """Individual field validation error"""
    field: str = Field(..., description="The field that failed validation")
    message: str = Field(..., description="Human-readable error message")
    code: str = Field(..., description="Machine-readable error code")
    value: Optional[Any] = Field(None, description="The invalid value that was provided")

class APIErrorResponse(BaseModel):
    """Standardized error response format"""
    success: bool = Field(False, description="Always false for error responses")
    error: str = Field(..., description="Error type or category")
    message: str = Field(..., description="Human-readable error message")
    status_code: int = Field(..., description="HTTP status code")
    error_code: ErrorCode = Field(..., description="Machine-readable error code")
    validation_errors: Optional[List[ValidationError]] = Field(
        None, 
        description="Detailed validation errors for 422 responses"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the error occurred")
    request_id: Optional[str] = Field(None, description="Unique request identifier for tracking")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error context")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class APISuccessResponse(BaseModel):
    """Standardized success response format"""
    success: bool = Field(True, description="Always true for success responses")
    data: Optional[Any] = Field(None, description="Response data")
    message: Optional[str] = Field(None, description="Optional success message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the response was generated")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }