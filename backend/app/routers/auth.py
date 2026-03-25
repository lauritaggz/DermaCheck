from datetime import datetime, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AppUser
from app.schemas import AuthResponse, LoginIn, RegisterIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

# Coste bcrypt (2^12 iteraciones internas). Subir en producción si la política de seguridad lo exige.
BCRYPT_ROUNDS = 12


def _hash_password(plain: str) -> str:
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def _verify_password(plain: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _user_to_out(row: AppUser) -> UserOut:
    created = row.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    return UserOut(
        id=str(row.id),
        email=row.email,
        name=row.name,
        created_at=created,
    )


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> AuthResponse:
    email = body.email.strip().lower()
    existing = db.execute(select(AppUser).where(AppUser.email == email)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este correo ya está registrado. Inicia sesión o usa otro correo.",
        )
    user = AppUser(
        email=email,
        name=body.name.strip(),
        password_hash=_hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(user=_user_to_out(user))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginIn, db: Session = Depends(get_db)) -> AuthResponse:
    email = body.email.strip().lower()
    user = db.execute(select(AppUser).where(AppUser.email == email)).scalar_one_or_none()
    if not user or not _verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )
    return AuthResponse(user=_user_to_out(user))
