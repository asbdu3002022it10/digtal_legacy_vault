from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, vault, nominee, audit
from app.core.config import get_settings


settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api")
app.include_router(vault.router, prefix="/api")
app.include_router(nominee.router, prefix="/api")
app.include_router(audit.router, prefix="/api")

