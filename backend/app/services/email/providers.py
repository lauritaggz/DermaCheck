from __future__ import annotations

import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, formatdate, make_msgid, parseaddr

import httpx

from app.services.email.base import EmailProvider
from app.services.email.exceptions import EmailDeliveryError


def _resolve_from_addresses(from_address: str, smtp_user: str) -> tuple[str, str]:
    """Separa cabecera From (con nombre) y remitente SMTP (solo email)."""
    name, addr = parseaddr(from_address)
    envelope = addr or smtp_user
    if name:
        header = formataddr((name, envelope))
    else:
        header = envelope
    return header, envelope


class ResendEmailProvider(EmailProvider):
    """Envío vía API de Resend (https://resend.com)."""

    API_URL = "https://api.resend.com/emails"

    def __init__(
        self,
        api_key: str,
        from_address: str,
        *,
        timeout_seconds: float = 30.0,
    ) -> None:
        self._api_key = api_key
        self._from_address = from_address
        self._timeout = timeout_seconds

    async def send_html(
        self,
        *,
        to: str,
        subject: str,
        html: str,
        reply_to: str | None = None,
        plain_text: str | None = None,
    ) -> None:
        payload: dict[str, object] = {
            "from": self._from_address,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        if reply_to:
            payload["reply_to"] = reply_to

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(self.API_URL, json=payload, headers=headers)
        except httpx.HTTPError as exc:
            raise EmailDeliveryError("Error de conexión con el proveedor de correo.") from exc

        if response.status_code >= 400:
            raise EmailDeliveryError("El proveedor de correo rechazó el envío.")


class SmtpEmailProvider(EmailProvider):
    """Envío vía SMTP (compatible con Mailgun, SendGrid SMTP, Gmail, etc.)."""

    def __init__(
        self,
        *,
        host: str,
        port: int,
        username: str,
        password: str,
        from_address: str,
        use_tls: bool = True,
    ) -> None:
        self._host = host
        self._port = port
        self._username = username
        self._password = password
        self._from_header, self._envelope_from = _resolve_from_addresses(from_address, username)
        self._use_tls = use_tls

    def _send_sync(
        self,
        *,
        to: str,
        subject: str,
        html: str,
        plain_text: str | None,
        reply_to: str | None,
    ) -> None:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self._from_header
        message["To"] = to
        message["Date"] = formatdate(localtime=True)
        message["Message-ID"] = make_msgid(domain=self._envelope_from.split("@")[-1])
        if reply_to:
            message["Reply-To"] = reply_to

        if plain_text:
            message.attach(MIMEText(plain_text, "plain", "utf-8"))
        message.attach(MIMEText(html, "html", "utf-8"))

        try:
            with smtplib.SMTP(self._host, self._port, timeout=30) as server:
                if self._use_tls:
                    server.starttls()
                if self._username:
                    server.login(self._username, self._password)
                refused = server.sendmail(self._envelope_from, [to], message.as_string())
                if refused:
                    raise EmailDeliveryError(
                        "El servidor de correo rechazó el destinatario."
                    )
        except smtplib.SMTPAuthenticationError as exc:
            raise EmailDeliveryError("Error de autenticación SMTP.") from exc
        except smtplib.SMTPException as exc:
            raise EmailDeliveryError("Error al enviar correo por SMTP.") from exc
        except OSError as exc:
            raise EmailDeliveryError("No se pudo conectar al servidor SMTP.") from exc

    async def send_html(
        self,
        *,
        to: str,
        subject: str,
        html: str,
        reply_to: str | None = None,
        plain_text: str | None = None,
    ) -> None:
        await asyncio.to_thread(
            self._send_sync,
            to=to,
            subject=subject,
            html=html,
            plain_text=plain_text,
            reply_to=reply_to,
        )
