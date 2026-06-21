"""Endpoint de envío del resumen de análisis por correo."""

from __future__ import annotations

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from app.schemas.email import SendSummaryEmailRequest, SendSummaryEmailResponse
from app.services.email_service import email_service

router = APIRouter(prefix="/analysis", tags=["analysis-email"])


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


@router.post(
    "/send-summary-email",
    response_model=SendSummaryEmailResponse,
    summary="Enviar resumen de análisis por correo",
)
async def send_summary_email(
    body: SendSummaryEmailRequest,
    request: Request,
) -> JSONResponse:
    """
    Envía el resumen del análisis al correo indicado.
    El email no se persiste; solo se usa durante esta petición.
    """
    result = await email_service.send_analysis_summary(
        email=str(body.email),
        analysis=body.analysis_result,
        client_key=_client_key(request),
    )

    if result.success:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result.model_dump(),
        )

    status_code = status.HTTP_400_BAD_REQUEST
    if "Demasiados intentos" in result.message:
        status_code = status.HTTP_429_TOO_MANY_REQUESTS
    elif "no está habilitado" in result.message or "No se pudo enviar" in result.message:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content=result.model_dump(),
    )
