from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    email: Optional[str] = None

class UserClaims(BaseModel):
    sub: str
    email: str
    aud: str
    role: str
    exp: int
    iat: int