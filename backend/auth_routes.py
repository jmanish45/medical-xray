"""
auth_routes.py — Denoise X Auth API Endpoints
===============================================
POST /api/auth/signup  — Register new user (full_name, email, password, profile)
POST /api/auth/signin  — Login (email + password)
GET  /api/auth/me      — Get current user from JWT Bearer token
"""

import logging
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth import (
    SignUpRequest,
    SignInRequest,
    UserPublic,
    AuthResponse,
    hash_password,
    verify_password,
    create_jwt,
    decode_jwt,
    get_db,
    VALID_PROFESSIONAL_ROLES,
)

logger = logging.getLogger("denoise_x.auth_routes")
router = APIRouter(prefix="/api/auth", tags=["Auth"])
security = HTTPBearer()


# ── Helpers ───────────────────────────────────────────────────────────────────
def _doc_to_user_public(doc: dict) -> UserPublic:
    return UserPublic(
        id=str(doc["_id"]),
        full_name=doc["full_name"],
        email=doc["email"],
        profile_type=doc["profile_type"],
        college_name=doc.get("college_name"),
        professional_role=doc.get("professional_role"),
        created_at=doc["created_at"],
    )


async def _get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    user_id = decode_jwt(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    db = get_db()
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found.")
    return user_doc


# ── POST /api/auth/signup ──────────────────────────────────────────────────────
@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(body: SignUpRequest):
    """Register a new user (student or medical professional)."""
    db = get_db()
    users = db["users"]

    # 1. Email uniqueness check
    existing = await users.find_one({"email": body.email.strip().lower()})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    # 2. Profile-type-specific field validation
    college_name = None
    professional_role = None

    if body.profile_type == "student":
        if not body.college_name or not body.college_name.strip():
            raise HTTPException(
                status_code=422,
                detail="Please enter your college / institution name.",
            )
        college_name = body.college_name.strip()
    else:
        if not body.professional_role or body.professional_role not in VALID_PROFESSIONAL_ROLES:
            raise HTTPException(
                status_code=422,
                detail="Please select your professional role.",
            )
        professional_role = body.professional_role

    # 3. Build and insert document
    user_doc = {
        "full_name": body.full_name.strip(),
        "email": body.email.strip().lower(),
        "password_hash": hash_password(body.password),
        "profile_type": body.profile_type,
        "college_name": college_name,
        "professional_role": professional_role,
        "created_at": datetime.now(timezone.utc),
    }

    result = await users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # 4. Ensure unique index exists (idempotent)
    await users.create_index("email", unique=True, background=True)

    token = create_jwt(str(result.inserted_id))
    logger.info("New user registered: %s  type=%s", body.full_name, body.profile_type)

    return AuthResponse(token=token, user=_doc_to_user_public(user_doc))


# ── POST /api/auth/signin ─────────────────────────────────────────────────────
@router.post("/signin", response_model=AuthResponse)
async def signin(body: SignInRequest):
    """Sign in with email + password."""
    db = get_db()
    email = body.email.strip().lower()

    user_doc = await db["users"].find_one({"email": email})

    if not user_doc or not verify_password(body.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    token = create_jwt(str(user_doc["_id"]))
    logger.info("User signed in: %s", user_doc["full_name"])

    return AuthResponse(token=token, user=_doc_to_user_public(user_doc))


# ── GET /api/auth/me ──────────────────────────────────────────────────────────
@router.get("/me", response_model=UserPublic)
async def get_me(current_user: dict = Depends(_get_current_user)):
    """Return the currently authenticated user's public profile."""
    return _doc_to_user_public(current_user)
