from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, vault, nominee, audit
from app.core.config import get_settings


settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME
)

# ✅ CORS fix (IMPORTANT)
origins = settings.BACKEND_CORS_ORIGINS or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Health check (deployment test)
@app.get("/health")
def health_check():
    return {"status": "ok"}


# ✅ API routes (clean prefix)
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(vault.router, prefix="/api/vault", tags=["Vault"])
app.include_router(nominee.router, prefix="/api/nominee", tags=["Nominee"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
