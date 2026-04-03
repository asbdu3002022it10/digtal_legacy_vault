import smtplib
from email.message import EmailMessage
from app.core.config import get_settings

settings = get_settings()

class EmailDeliveryError(RuntimeError):
    pass


def send_email(to_email: str, subject: str, body: str):
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        raise EmailDeliveryError("SMTP email settings are missing on the server.")

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_EMAIL
    msg["To"] = to_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)
            print(f"Sent email to {to_email}")
    except Exception as e:
        raise EmailDeliveryError(f"Failed to send verification email: {e}") from e


def send_otp_email(to_email: str, otp: str):
    send_email(
        to_email=to_email,
        subject="Your Verification Code",
        body=(
            f"Your verification code for Digital Legacy Vault is: {otp}\n\n"
            "This code will expire in 10 minutes."
        ),
    )
