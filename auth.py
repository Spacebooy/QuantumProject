import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import get_db
from models import User, LoginLog, SimulationUsage, utc_now

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError("Set JWT_SECRET before starting the API (see .env.example).")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


# Password hashing helpers using bcrypt directly
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


# JWT helpers
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None


# Authentication Dependencies
def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    token = parts[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        return None

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    return user


def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


# Pydantic Request & Response Schemas
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str




class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    auth_provider: str
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login_at: Optional[datetime] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Auth Routes
@router.post("/register", response_model=AuthResponse)
def register(
    request: RegisterRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    email = request.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required."
        )

    if not request.password or len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    if len(request.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password must be at most 72 UTF-8 bytes.")

    full_name = request.full_name.strip()
    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required."
        )

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead."
        )

    new_user = User(
        email=email,
        password_hash=hash_password(request.password),
        full_name=full_name,
        role="student",
        auth_provider="local",
        created_at=utc_now(),
        last_login_at=utc_now()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log successful registration & login
    client_ip = req.client.host if req.client else None
    user_agent = req.headers.get("user-agent")
    login_log = LoginLog(
        user_id=new_user.id,
        auth_provider="local",
        ip_address=client_ip,
        user_agent=user_agent,
        status="success",
        created_at=utc_now()
    )
    db.add(login_log)
    db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            role=new_user.role,
            auth_provider=new_user.auth_provider,
            avatar_url=new_user.avatar_url,
            created_at=new_user.created_at,
            last_login_at=new_user.last_login_at
        )
    )


@router.post("/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    email = request.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    client_ip = req.client.host if req.client else None
    user_agent = req.headers.get("user-agent")

    if not user or not user.is_active or not user.password_hash or not verify_password(request.password, user.password_hash):
        if user:
            failed_log = LoginLog(
                user_id=user.id,
                auth_provider="local",
                ip_address=client_ip,
                user_agent=user_agent,
                status="failed",
                created_at=utc_now()
            )
            db.add(failed_log)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user.last_login_at = utc_now()
    login_log = LoginLog(
        user_id=user.id,
        auth_provider="local",
        ip_address=client_ip,
        user_agent=user_agent,
        status="success",
        created_at=utc_now()
    )
    db.add(login_log)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            auth_provider=user.auth_provider,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )
    )




@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        auth_provider=current_user.auth_provider,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        last_login_at=current_user.last_login_at
    )


@router.get("/usage")
def get_user_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve past simulation usage for the logged-in student
    records = (
        db.query(SimulationUsage)
        .filter(SimulationUsage.user_id == current_user.id)
        .order_by(desc(SimulationUsage.created_at))
        .limit(50)
        .all()
    )

    total_count = (
        db.query(func.count(SimulationUsage.id))
        .filter(SimulationUsage.user_id == current_user.id)
        .scalar()
    ) or 0

    max_qubits = (
        db.query(func.max(SimulationUsage.num_qubits))
        .filter(SimulationUsage.user_id == current_user.id)
        .scalar()
    ) or 0

    avg_qubits = (
        db.query(func.avg(SimulationUsage.num_qubits))
        .filter(SimulationUsage.user_id == current_user.id)
        .scalar()
    ) or 0

    return {
        "user_id": current_user.id,
        "total_simulations": total_count,
        "max_qubits_used": max_qubits,
        "avg_qubits_used": round(float(avg_qubits), 2) if avg_qubits else 0,
        "simulations": [
            {
                "id": r.id,
                "sim_type": r.sim_type,
                "num_qubits": r.num_qubits,
                "gate_count": r.gate_count,
                "mode": r.mode,
                "operations_summary": r.operations_summary,
                "execution_time_ms": r.execution_time_ms,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ]
    }
