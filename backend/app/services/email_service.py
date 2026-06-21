"""Servicio de envío del resumen de análisis por correo."""

from __future__ import annotations

import logging
import re

from app.config import settings
from app.schemas.email import AnalysisSummaryPayload, SendSummaryEmailResponse
from app.services.email.build_analysis_email_html import (
    build_analysis_email_html,
    build_analysis_email_text,
)
from app.services.email.exceptions import EmailDeliveryError
from app.services.email.factory import create_email_provider
from app.services.email.rate_limit import InMemoryRateLimiter

logger = logging.getLogger(__name__)

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
EMAIL_SUBJECT = "Tu resumen de analisis - DermaCheck"

_rate_limiter = InMemoryRateLimiter(
    max_requests=settings.email_rate_limit_per_minute,
    window_seconds=60,
)


def mask_email(email: str) -> str:
    """Enmascara el correo para logs (no registrar el destinatario completo)."""
    local, _, domain = email.partition("@")
    if not domain:
        return "***"
    if len(local) <= 2:
        return f"**@{domain}"
    return f"{local[:2]}***@{domain}"


def validate_email_format(email: str) -> str | None:
    trimmed = email.strip()
    if not trimmed or len(trimmed) > 254:
        return None
    if not EMAIL_PATTERN.match(trimmed):
        return None
    return trimmed


class EmailService:
    """Orquesta validación, generación HTML y envío vía proveedor configurado."""

    def __init__(self) -> None:
        self._provider = create_email_provider(settings)

    async def send_analysis_summary(
        self,
        *,
        email: str,
        analysis: AnalysisSummaryPayload,
        client_key: str,
    ) -> SendSummaryEmailResponse:
        recipient = validate_email_format(email)
        if not recipient:
            return SendSummaryEmailResponse(
                success=False,
                message="El correo ingresado no es válido.",
            )

        if not analysis.diagnosis:
            return SendSummaryEmailResponse(
                success=False,
                message="No hay resultado de análisis para enviar.",
            )

        if not _rate_limiter.is_allowed(client_key):
            logger.warning("Rate limit alcanzado para envío de resumen (cliente=%s)", client_key)
            return SendSummaryEmailResponse(
                success=False,
                message="Demasiados intentos. Espera un momento e intenta nuevamente.",
            )

        if not settings.email_enabled:
            logger.info("Envío de correo deshabilitado (EMAIL_ENABLED=false)")
            return SendSummaryEmailResponse(
                success=False,
                message="El envío por correo no está habilitado en el servidor.",
            )

        if self._provider is None:
            logger.error("Proveedor de correo no configurado (provider=%s)", settings.email_provider)
            return SendSummaryEmailResponse(
                success=False,
                message="No se pudo enviar el resumen. Intenta nuevamente.",
            )

        html = build_analysis_email_html(analysis.diagnosis, analysis.timestamp)
        plain = build_analysis_email_text(analysis.diagnosis, analysis.timestamp)
        reply_to = settings.email_reply_to.strip() or None

        try:
            await self._provider.send_html(
                to=recipient,
                subject=EMAIL_SUBJECT,
                html=html,
                plain_text=plain,
                reply_to=reply_to,
            )
        except EmailDeliveryError:
            logger.error(
                "Fallo al enviar resumen de análisis a %s",
                mask_email(recipient),
            )
            return SendSummaryEmailResponse(
                success=False,
                message="No se pudo enviar el resumen. Intenta nuevamente.",
            )

        logger.info("Resumen de análisis enviado a %s", mask_email(recipient))
        return SendSummaryEmailResponse(
            success=True,
            message="Resumen enviado correctamente. Revisa tu bandeja y la carpeta de spam.",
        )


email_service = EmailService()
