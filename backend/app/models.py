"""
Modelos legales / consentimientos (#115, #116).

Catálogo `legal_documents` + aceptaciones `user_document_acceptances`.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import engine
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class AppUser(Base):
    """Usuarios de la app (registro/login). Contraseña solo como hash."""

    __tablename__ = "app_users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    version: Mapped[str] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    acceptances: Mapped[list["UserDocumentAcceptance"]] = relationship(back_populates="document")


class UserDocumentAcceptance(Base):
    __tablename__ = "user_document_acceptances"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "document_id",
            "document_version_accepted",
            name="uq_user_document_version",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("legal_documents.id", ondelete="RESTRICT"))
    document_version_accepted: Mapped[str] = mapped_column(String(32))
    accepted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    status: Mapped[str] = mapped_column(String(32), default="accepted")

    document: Mapped[LegalDocument] = relationship(back_populates="acceptances")


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
