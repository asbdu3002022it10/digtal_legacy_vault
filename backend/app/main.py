from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.api import audit, auth, nominee, vault
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine


settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)


def _ensure_user_passkey_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    required_columns = {
        "webauthn_credential_id": "TEXT",
        "webauthn_public_key": "TEXT",
        "webauthn_sign_count": "INTEGER NOT NULL DEFAULT 0",
        "webauthn_registered_at": "TIMESTAMP",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
                )


@app.on_event("startup")
def ensure_database_tables() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_user_passkey_columns()


origins = settings.BACKEND_CORS_ORIGINS or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(vault.router, prefix="/api", tags=["Vault"])
app.include_router(nominee.router, prefix="/api", tags=["Nominee"])
app.include_router(audit.router, prefix="/api", tags=["Audit"])
