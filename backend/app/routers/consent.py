"""
HU09: registro de aceptaciones (#115) y consulta (#116).

La hora de aceptación la fija el servidor (UTC) al persistir, no el cliente.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LegalDocument, UserDocumentAcceptance
from app.schemas import AcceptanceOut, ConsentAcceptIn, ConsentAcceptResponse

router = APIRouter(prefix="/consents", tags=["consents"])


@router.post("/accept", response_model=ConsentAcceptResponse)
def register_acceptances(body: ConsentAcceptIn, db: Session = Depends(get_db)) -> ConsentAcceptResponse:
    now = datetime.now(timezone.utc)
    results: list[AcceptanceOut] = []
    uid = body.user_id.strip()

    for item in body.items:
        doc = db.execute(select(LegalDocument).where(LegalDocument.slug == item.slug)).scalar_one_or_none()
        if not doc or not doc.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Documento desconocido o inactivo: {item.slug}",
            )
        if item.version != doc.version:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Versión no vigente para {item.slug}. Se esperaba {doc.version}.",
            )

        existing = db.execute(
            select(UserDocumentAcceptance).where(
                UserDocumentAcceptance.user_id == uid,
                UserDocumentAcceptance.document_id == doc.id,
                UserDocumentAcceptance.document_version_accepted == doc.version,
            )
        ).scalar_one_or_none()

        if existing:
            results.append(
                AcceptanceOut(
                    document_slug=doc.slug,
                    title=doc.title,
                    version_accepted=existing.document_version_accepted,
                    accepted_at=existing.accepted_at,
                    status=existing.status,
                )
            )
            continue

        row = UserDocumentAcceptance(
            user_id=uid,
            document_id=doc.id,
            document_version_accepted=doc.version,
            accepted_at=now,
            status="accepted",
        )
        db.add(row)
        db.flush()
        results.append(
            AcceptanceOut(
                document_slug=doc.slug,
                title=doc.title,
                version_accepted=row.document_version_accepted,
                accepted_at=row.accepted_at,
                status=row.status,
            )
        )

    db.commit()
    return ConsentAcceptResponse(acceptances=results)


@router.get("/users/{user_id}/acceptances", response_model=list[AcceptanceOut])
def list_user_acceptances(user_id: str, db: Session = Depends(get_db)) -> list[AcceptanceOut]:
    q = (
        select(UserDocumentAcceptance, LegalDocument)
        .join(LegalDocument, LegalDocument.id == UserDocumentAcceptance.document_id)
        .where(UserDocumentAcceptance.user_id == user_id.strip())
        .order_by(UserDocumentAcceptance.accepted_at.desc())
    )
    rows = db.execute(q).all()
    return [
        AcceptanceOut(
            document_slug=doc.slug,
            title=doc.title,
            version_accepted=acc.document_version_accepted,
            accepted_at=acc.accepted_at,
            status=acc.status,
        )
        for acc, doc in rows
    ]
