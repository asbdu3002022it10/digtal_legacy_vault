from functools import lru_cache
from pathlib import Path
from typing import Optional, List

from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Legacy Vault"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    SMTP_EMAIL: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    EMAIL_REPLY_TO: Optional[str] = None
    FRONTEND_URL: str = "http://localhost:5173"
    WEBAUTHN_RP_ID: Optional[str] = None
    WEBAUTHN_ORIGIN: Optional[str] = None

    model_config = SettingsConfigDict(env_file=str(ENV_FILE), case_sensitive=True)

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        # Prefer this project's backend/.env over machine-level environment
        # variables so local app settings are not silently overridden.
        return (
            init_settings,
            dotenv_settings,
            env_settings,
            file_secret_settings,
        )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


