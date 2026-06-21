"""
Modelos legales / consentimientos (#115, #116).

Catálogo `legal_documents` + aceptaciones `user_document_acceptances`.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
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

    # Relación con análisis
    analyses: Mapped[list["SkinAnalysis"]] = relationship(back_populates="user")


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


class ProductSearchCache(Base):
    """Caché de búsquedas HU22 (SQLite/PostgreSQL). Evita repetir scraping."""

    __tablename__ = "product_search_cache"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    query_normalized: Mapped[str] = mapped_column(String(512), unique=True, index=True)
    response_json: Mapped[str] = mapped_column(Text())
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class ProductFallback(Base):
    """Catálogo de respaldo cuando el scraper no está disponible (HU22)."""

    __tablename__ = "product_fallback_catalog"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    query_keywords: Mapped[str] = mapped_column(String(512), index=True)
    product_json: Mapped[str] = mapped_column(Text())
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class SkinAnalysis(Base):
    """Registro de análisis de piel realizados por los usuarios."""

    __tablename__ = "skin_analyses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_users.id"), index=True)
    image_filename: Mapped[str] = mapped_column(String(255))
    image_path: Mapped[str] = mapped_column(String(512))
    image_size_bytes: Mapped[int | None] = mapped_column(Integer(), nullable=True)
    
    # Configuración del análisis
    model_conf_threshold: Mapped[float] = mapped_column(Float(), default=0.25)
    
    # Resultados
    total_detections: Mapped[int] = mapped_column(Integer(), default=0)
    detections_json: Mapped[str | None] = mapped_column(Text(), nullable=True)
    
    # Métricas de rendimiento
    processing_time_ms: Mapped[float | None] = mapped_column(Float(), nullable=True)
    
    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )
    
    # Relación con usuario
    user: Mapped[AppUser] = relationship(back_populates="analyses")


class TrainingImageRecord(Base):
    """Imagen facial conservada con consentimiento opcional de entrenamiento (tótem)."""

    __tablename__ = "training_image_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    legal_version: Mapped[str] = mapped_column(String(32))
    consent_accepted: Mapped[bool] = mapped_column(Boolean(), default=True)
    privacy_accepted: Mapped[bool] = mapped_column(Boolean(), default=True)
    allow_training_storage: Mapped[bool] = mapped_column(Boolean(), default=True)
    image_path: Mapped[str] = mapped_column(String(512))
    detected_conditions_json: Mapped[str | None] = mapped_column(Text(), nullable=True)
    source: Mapped[str] = mapped_column(String(32), default="totem")


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
