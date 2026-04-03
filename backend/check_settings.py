from app.core.config import get_settings
settings = get_settings()
print(f"SMTP_EMAIL: '{settings.SMTP_EMAIL}'")
print(f"SMTP_PASSWORD: '{settings.SMTP_PASSWORD}'")
