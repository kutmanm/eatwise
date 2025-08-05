from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from schemas.error import APIErrorResponse, APISuccessResponse, ErrorCode, ValidationError
from utils.exceptions import (
    EatWiseException, AuthenticationException, AuthorizationException, 
    NotFoundException, ConflictException, DatabaseException
)
from typing import Any, Optional, List, Dict
from datetime import datetime

def success_response(
    data: Any = None, 
    message: Optional[str] = None,
    status_code: int = status.HTTP_200_OK
) -> JSONResponse:
    """Create a standardized success response"""
    response = APISuccessResponse(
        data=data,
        message=message
    )
    return JSONResponse(
        status_code=status_code,
        content=response.dict()
    )

def error_response(
    message: str,
    error_code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    validation_errors: Optional[List[ValidationError]] = None,
    details: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """Create a standardized error response"""
    response = APIErrorResponse(
        error=error_code.value,
        message=message,
        status_code=status_code,
        error_code=error_code,
        validation_errors=validation_errors,
        details=details
    )
    return JSONResponse(
        status_code=status_code,
        content=response.dict()
    )

def validation_error_response(
    message: str = "Validation failed",
    validation_errors: List[ValidationError] = None
) -> JSONResponse:
    """Create a validation error response"""
    return error_response(
        message=message,
        error_code=ErrorCode.VALIDATION_ERROR,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        validation_errors=validation_errors
    )

def not_found_response(message: str = "Resource not found") -> JSONResponse:
    """Create a not found error response"""
    return error_response(
        message=message,
        error_code=ErrorCode.NOT_FOUND,
        status_code=status.HTTP_404_NOT_FOUND
    )

def unauthorized_response(message: str = "Authentication required") -> JSONResponse:
    """Create an unauthorized error response"""
    return error_response(
        message=message,
        error_code=ErrorCode.AUTHENTICATION_ERROR,
        status_code=status.HTTP_401_UNAUTHORIZED
    )

def forbidden_response(message: str = "Access denied") -> JSONResponse:
    """Create a forbidden error response"""
    return error_response(
        message=message,
        error_code=ErrorCode.AUTHORIZATION_ERROR,
        status_code=status.HTTP_403_FORBIDDEN
    )

def conflict_response(message: str = "Resource conflict") -> JSONResponse:
    """Create a conflict error response"""
    return error_response(
        message=message,
        error_code=ErrorCode.CONFLICT,
        status_code=status.HTTP_409_CONFLICT
    )

def database_error_response(message: str = "Database operation failed") -> JSONResponse:
    """Create a database error response"""
    return error_response(
        message=message,
        error_code=ErrorCode.DATABASE_ERROR,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

# Exception raising helpers for consistent error handling
def raise_not_found(message: str = "Resource not found", details: Dict[str, Any] = None):
    """Raise a NotFoundException"""
    raise NotFoundException(message=message, details=details)

def raise_unauthorized(message: str = "Authentication required", details: Dict[str, Any] = None):
    """Raise an AuthenticationException"""
    raise AuthenticationException(message=message, details=details)

def raise_forbidden(message: str = "Access denied", details: Dict[str, Any] = None):
    """Raise an AuthorizationException"""
    raise AuthorizationException(message=message, details=details)

def raise_conflict(message: str = "Resource conflict", details: Dict[str, Any] = None):
    """Raise a ConflictException"""
    raise ConflictException(message=message, details=details)

def raise_database_error(message: str = "Database operation failed", details: Dict[str, Any] = None):
    """Raise a DatabaseException"""
    raise DatabaseException(message=message, details=details)

def raise_validation_error(
    message: str = "Validation failed", 
    field_errors: Dict[str, str] = None,
    details: Dict[str, Any] = None
):
    """Raise a validation error with field-level errors"""
    validation_errors = []
    if field_errors:
        for field, error_message in field_errors.items():
            validation_errors.append(
                ValidationError(
                    field=field,
                    message=error_message,
                    code="validation_error"
                )
            )
    
    raise EatWiseException(
        message=message,
        error_code=ErrorCode.VALIDATION_ERROR,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"validation_errors": validation_errors, **(details or {})}
    )