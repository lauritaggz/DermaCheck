"""Usuario técnico de tótem (sin login del cliente final)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AppUser

KIOSK_EMAIL = "kiosk@dermacheck.internal"
KIOSK_NAME = "Tótem DermaCheck"


def ensure_kiosk_user(db: Session) -> AppUser:
    row = db.execute(select(AppUser).where(AppUser.email == KIOSK_EMAIL)).scalar_one_or_none()
    if row is not None:
        return row

    row = AppUser(
        email=KIOSK_EMAIL,
        password_hash="kiosk-no-login",
        name=KIOSK_NAME,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
