"""Documentos legales vigentes (versiones alineadas con la app web)."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import LegalDocument

DEFAULT_DOCS: list[dict[str, str | bool]] = [
    {
        "slug": "consent_informed",
        "title": "Consentimiento informado para análisis dermatológico orientativo",
        "version": "2.0",
        "is_active": True,
    },
    {
        "slug": "privacy_policy",
        "title": "Política de privacidad resumida",
        "version": "2.0",
        "is_active": True,
    },
    {
        "slug": "consent_training",
        "title": "Autorización opcional para mejora del modelo",
        "version": "1.0",
        "is_active": True,
    },
]


def seed_legal_documents(db: Session) -> None:
    for row in DEFAULT_DOCS:
        slug = str(row["slug"])
        existing = db.execute(select(LegalDocument).where(LegalDocument.slug == slug)).scalar_one_or_none()
        if existing:
            existing.title = str(row["title"])
            existing.version = str(row["version"])
            existing.is_active = bool(row["is_active"])
        else:
            db.add(
                LegalDocument(
                    slug=slug,
                    title=str(row["title"]),
                    version=str(row["version"]),
                    is_active=bool(row["is_active"]),
                )
            )
    db.commit()
