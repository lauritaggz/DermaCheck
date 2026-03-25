from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings

def _engine_kwargs() -> dict:
    url = settings.database_url
    if url.startswith("sqlite"):
        # FastAPI + SQLite: permitir sesiones desde distintos hilos
        return {
            "connect_args": {"check_same_thread": False},
            "echo": False,
        }
    return {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "echo": False,
    }


engine = create_engine(settings.database_url, **_engine_kwargs())

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
