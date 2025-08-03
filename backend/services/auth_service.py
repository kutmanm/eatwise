from typing import Dict, Any, Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from models.database import get_db
from models.user import User
from schemas.auth import UserClaims, TokenData
from utils.config import settings
from uuid import UUID

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserClaims:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_claims = UserClaims(**payload)
        return user_claims
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    claims: UserClaims = Depends(verify_token),
    db: Session = Depends(get_db)
) -> User:
    user_id = UUID(claims.sub)
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        user = User(
            id=user_id,
            email=claims.email
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        return None
    
    try:
        claims = await verify_token(credentials)
        user_id = UUID(claims.sub)
        return db.query(User).filter(User.id == user_id).first()
    except HTTPException:
        return None

def check_premium_access(user: User) -> bool:
    from models.user import UserRole
    return user.role == UserRole.PREMIUM

def require_premium(user: User = Depends(get_current_user)) -> User:
    if not check_premium_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required"
        )
    return user