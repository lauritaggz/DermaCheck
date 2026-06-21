from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings


def _engine_kwargs() -> dict:
    url = settings.database_url
    if url.startswith("sqlite"):
        return {
            "connect_args": {"check_same_thread": False, "timeout": 30},
            "echo": False,
        }
    return {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "echo": False,
    }


engine = create_engine(settings.database_url, **_engine_kwargs())


@event.listens_for(engine, "connect")
def _set_sqlite_wal(dbapi_connection, _connection_record) -> None:
    if settings.database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
