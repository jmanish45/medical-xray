"""
auth.py — Denoise X Authentication Core
=========================================
Handles:
  - MongoDB async connection (motor)
  - Password hashing & verification (passlib/bcrypt)
  - JWT creation & decoding (python-jose)
  - Pydantic user models
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, field_validator

load_dotenv()

logger = logging.getLogger("denoise_x.auth")

# ── Config ────────────────────────────────────────────────────────────────────
MONGODB_URI = os.getenv("MONGODB_URI", "")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days
DB_NAME = "denoisex"

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_jwt(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> Optional[str]:
    """Returns user_id (str) if token is valid, else None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# ── MongoDB ───────────────────────────────────────────────────────────────────
_client: Optional[AsyncIOMotorClient] = None


def get_db():
    global _client
    if _client is None:
        if not MONGODB_URI or MONGODB_URI.startswith("mongodb+srv://<"):
            raise RuntimeError(
                "MONGODB_URI is not configured. "
                "Please fill in backend/.env with your MongoDB Atlas connection string."
            )
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client[DB_NAME]


# ── Valid professional roles ──────────────────────────────────────────────────
VALID_PROFESSIONAL_ROLES = [
    "pg_resident",
    "junior_doctor",
    "fellow",
    "educator",
]

PROFESSIONAL_ROLE_LABELS = {
    "pg_resident":   "Postgraduate Resident (MD/MS)",
    "junior_doctor": "Junior Doctor / Intern",
    "fellow":        "Fellow / Senior Resident",
    "educator":      "Educator / Faculty",
}


# ── Pydantic Models ───────────────────────────────────────────────────────────
class SignUpRequest(BaseModel):
    full_name: str
    email: str
    password: str
    profile_type: str          # "student" | one of VALID_PROFESSIONAL_ROLES
    college_name: Optional[str] = None
    professional_role: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters.")
        if len(v) > 60:
            raise ValueError("Name must be at most 60 characters.")
        return v

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Enter a valid email address.")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("profile_type")
    @classmethod
    def profile_type_valid(cls, v: str) -> str:
        valid = ["student"] + VALID_PROFESSIONAL_ROLES
        if v not in valid:
            raise ValueError(f"profile_type must be one of: {valid}")
        return v


class SignInRequest(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    id: str
    full_name: str
    email: str
    profile_type: str
    college_name: Optional[str] = None
    professional_role: Optional[str] = None
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserPublic
