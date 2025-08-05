from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time
import uuid
from typing import Callable

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Add request ID to request state for use in exception handlers
        request.state.request_id = request_id
        
        # Log incoming request
        start_time = time.time()
        logger.info(
            f"Incoming request - ID: {request_id}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "client_host": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
                "content_type": request.headers.get("content-type")
            }
        )
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Request completed - ID: {request_id}",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                    "process_time": f"{process_time:.4f}s"
                }
            )
            
            # Add request ID to response headers for debugging
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as exc:
            # Log exception during request processing
            process_time = time.time() - start_time
            logger.error(
                f"Request failed - ID: {request_id}",
                extra={
                    "request_id": request_id,
                    "exception_type": type(exc).__name__,
                    "exception_message": str(exc),
                    "process_time": f"{process_time:.4f}s"
                }
            )
            raise exc

class ErrorContextMiddleware(BaseHTTPMiddleware):
    """Middleware to add error context to requests"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Add error context to request state
        request.state.error_context = {
            "method": request.method,
            "url": str(request.url),
            "client_host": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "content_type": request.headers.get("content-type")
        }
        
        return await call_next(request)