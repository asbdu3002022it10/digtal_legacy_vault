import json
import smtplib
from email.message import EmailMessage
from urllib import error, request

from app.core.config import get_settings


settings = get_settings()


class EmailDeliveryError(RuntimeError):
    pass


def _send_via_resend(to_email: str, subject: str, body: str) -> None:
    from_email = settings.EMAIL_FROM or "Digital Legacy Vault <onboarding@resend.dev>"
    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "text": body,
    }
    if settings.EMAIL_REPLY_TO:
        payload["reply_to"] = settings.EMAIL_REPLY_TO

    req = request.Request(
        url="https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=20) as response:
            if response.status not in (200, 201):
                response_body = response.read().decode("utf-8", errors="replace")
                raise EmailDeliveryError(
                    f"Resend email API returned {response.status}: {response_body}"
                )
    except error.HTTPError as exc:
        response_body = exc.read().decode("utf-8", errors="replace")
        raise EmailDeliveryError(
            f"Resend email API error {exc.code}: {response_body}"
        ) from exc
    except error.URLError as exc:
        raise EmailDeliveryError(f"Resend network error: {exc.reason}") from exc


def _send_via_smtp(to_email: str, subject: str, body: str) -> None:
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
    except Exception as exc:
        raise EmailDeliveryError(f"Failed to send email via SMTP: {exc}") from exc


def send_email(to_email: str, subject: str, body: str) -> None:
    if settings.RESEND_API_KEY:
        _send_via_resend(to_email=to_email, subject=subject, body=body)
        return

    _send_via_smtp(to_email=to_email, subject=subject, body=body)


def send_otp_email(to_email: str, otp: str) -> None:
    send_email(
        to_email=to_email,
        subject="Your Verification Code",
        body=(
            f"Your verification code for Digital Legacy Vault is: {otp}\n\n"
            "This code will expire in 10 minutes."
        ),
    )
