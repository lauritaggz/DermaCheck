from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.models import create_tables
from app.routers import analysis_full, analysis_inference, analysis_upload, auth, consent
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


app = FastAPI(title="DermaCheck API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(consent.router, prefix=settings.api_prefix)
app.include_router(analysis_upload.router, prefix=settings.api_prefix)
app.include_router(analysis_inference.router, prefix=settings.api_prefix)
app.include_router(analysis_full.router, prefix=settings.api_prefix)

# Servir archivos estáticos (imágenes subidas)
static_path = Path(__file__).parent.parent / "static"
static_path.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
