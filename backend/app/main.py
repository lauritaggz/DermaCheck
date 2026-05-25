from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.models import create_tables
from app.routers import (
    analysis_expression_lines,
    analysis_full,
    analysis_inference,
    analysis_upload,
    auth,
    consent,
    logs,
)
from app.seed_legal_documents import seed_legal_documents
from app.database import SessionLocal


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    db = SessionLocal()
    try:
        seed_legal_documents(db)
    finally:
        db.close()
    yield


import os

cors_origins_raw = os.environ.get("CORS_ORIGINS", "")
if cors_origins_raw:
    origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app = FastAPI(title="DermaCheck API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(consent.router, prefix=settings.api_prefix)
app.include_router(analysis_upload.router, prefix=settings.api_prefix)
app.include_router(analysis_inference.router, prefix=settings.api_prefix)
app.include_router(analysis_expression_lines.router, prefix=settings.api_prefix)
app.include_router(analysis_full.router, prefix=settings.api_prefix)
app.include_router(logs.router, prefix=settings.api_prefix)

# Servir archivos estáticos (imágenes subidas)
uploads_path = Path(__file__).parent.parent / "uploads"
uploads_path.mkdir(exist_ok=True)
# Montar ANTES del health endpoint para que funcione correctamente
app.mount("/uploads", StaticFiles(directory=str(uploads_path), html=False), name="uploads")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
