from __future__ import annotations

from app.config import Settings
from app.services.email.base import EmailProvider
from app.services.email.providers import ResendEmailProvider, SmtpEmailProvider


def create_email_provider(settings: Settings) -> EmailProvider | None:
    """Crea el proveedor configurado o None si el envío está deshabilitado."""
    if not settings.email_enabled:
        return None

    provider = settings.email_provider.lower().strip()

    if provider == "resend":
        if not settings.email_api_key:
            return None
        return ResendEmailProvider(
            settings.email_api_key,
            settings.email_from,
        )

    if provider == "smtp":
        if not settings.email_smtp_host:
            return None
        return SmtpEmailProvider(
            host=settings.email_smtp_host,
            port=settings.email_smtp_port,
            username=settings.email_smtp_user,
            password=settings.email_smtp_password,
            from_address=settings.email_from,
            use_tls=settings.email_smtp_use_tls,
        )

    return None
