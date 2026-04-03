from sqlalchemy.orm import declarative_base


Base = declarative_base()

# Import models here so Alembic can discover them
try:
    from app.models import user, vault, nominee  # noqa: F401
except Exception:
    # During initial setup migrations may run before models exist.
    pass

