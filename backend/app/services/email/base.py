from __future__ import annotations

from abc import ABC, abstractmethod


class EmailProvider(ABC):
    """Interfaz común para proveedores de correo."""

    @abstractmethod
    async def send_html(
        self,
        *,
        to: str,
        subject: str,
        html: str,
        reply_to: str | None = None,
        plain_text: str | None = None,
    ) -> None:
        """Envía un correo HTML. Lanza EmailDeliveryError si falla."""
