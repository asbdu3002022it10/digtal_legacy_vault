from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


settings = get_settings()


def _normalize_database_url(url: str) -> str:
    # This app uses a synchronous SQLAlchemy session, so asyncpg URLs need to be
    # mapped to a synchronous Postgres driver before the engine is created.
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
    return url

engine = create_engine(
    _normalize_database_url(str(settings.DATABASE_URL)),
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

