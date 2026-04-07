from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import audit, auth, nominee, vault
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine


settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)


@app.on_event("startup")
def ensure_database_tables() -> None:
    # Fresh Render Postgres instances start empty, so create tables on boot.
    Base.metadata.create_all(bind=engine)


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
app.include_router(vault.router, prefix="/api/vault", tags=["Vault"])
app.include_router(nominee.router, prefix="/api/nominee", tags=["Nominee"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
