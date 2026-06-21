from datetime import datetime

from pydantic import BaseModel, Field


class AcceptItemIn(BaseModel):
    slug: str = Field(..., min_length=1, max_length=64)
    version: str = Field(..., min_length=1, max_length=32)


class ConsentAcceptIn(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    session_id: str | None = Field(
        default=None,
        max_length=64,
        description="Identificador anónimo del flujo en tótem",
    )
    items: list[AcceptItemIn] = Field(..., min_length=1)
    consent_analysis: bool = Field(..., description="Aceptación del consentimiento informado")
    consent_privacy: bool = Field(..., description="Aceptación de la política de privacidad")
    consent_training: bool = Field(
        default=False,
        description="Autorización opcional para uso de imágenes en mejora del modelo",
    )
    consent_analysis_version: str | None = Field(default=None, max_length=32)
    privacy_policy_version: str | None = Field(default=None, max_length=32)
    training_consent_version: str | None = Field(default=None, max_length=32)


class AcceptanceOut(BaseModel):
    document_slug: str
    title: str
    version_accepted: str
    accepted_at: datetime
    status: str

    model_config = {"from_attributes": False}


class ConsentAcceptResponse(BaseModel):
    acceptances: list[AcceptanceOut]


class RegisterIn(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    name: str = Field(..., min_length=2, max_length=255)


class LoginIn(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserOut
