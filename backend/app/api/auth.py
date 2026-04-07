import base64
import json
import secrets
from datetime import datetime, timedelta
from typing import Any
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers import options_to_json
from webauthn.helpers.structs import (
    AuthenticatorAttachment,
    AuthenticatorSelectionCriteria,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from app.core.config import get_settings
from app.core.email import EmailDeliveryError, send_otp_email
from app.core.security import create_access_token, get_current_user
from app.db.session import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.user_schema import Token, UserRead


router = APIRouter(tags=["auth"])
settings = get_settings()


def normalize_dob(value: str) -> str | None:
    raw = value.strip()
    for fmt in ("%Y-%m-%d", "%d%m%Y", "%d-%m-%Y", "%d/%m/%Y", "%Y%m%d"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def _bytes_to_base64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("utf-8")


def _base64url_to_bytes(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")


def _webauthn_origin() -> str:
    return (settings.WEBAUTHN_ORIGIN or settings.FRONTEND_URL).rstrip("/")


def _webauthn_rp_id() -> str:
    configured = settings.WEBAUTHN_RP_ID
    if configured:
        return configured

    parsed = urlparse(_webauthn_origin())
    if not parsed.hostname:
        raise HTTPException(status_code=500, detail="WebAuthn RP ID is not configured.")

    return parsed.hostname


def _make_passkey_challenge_token(challenge: str) -> str:
    expires = datetime.utcnow() + timedelta(minutes=5)
    payload = {"type": "passkey_challenge", "challenge": challenge, "exp": expires}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _read_passkey_challenge_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Passkey session expired.") from exc

    if payload.get("type") != "passkey_challenge" or not payload.get("challenge"):
        raise HTTPException(status_code=401, detail="Invalid passkey session.")

    return str(payload["challenge"])


def _has_passkey(user: User) -> bool:
    return bool(user.webauthn_credential_id and user.webauthn_public_key)


class EmailRequest(BaseModel):
    email: EmailStr
    dob: str


class OtpVerify(BaseModel):
    email: EmailStr
    otp: str
    country: str | None = None
    state: str | None = None
    district: str | None = None


class SecuritySetupRequest(BaseModel):
    email: EmailStr
    otp: str
    q1: str
    a1: str
    q2: str
    a2: str
    q3: str
    a3: str


class SecurityVerifyRequest(BaseModel):
    email: EmailStr
    otp: str
    a1: str
    a2: str
    a3: str
    country: str | None = None
    state: str | None = None
    district: str | None = None


class PasskeyStatusResponse(BaseModel):
    passkey_registered: bool


class PasskeyVerifyRequest(BaseModel):
    credential: dict[str, Any]


class PasskeyAuthenticateVerifyRequest(BaseModel):
    credential: dict[str, Any]
    challenge_token: str


@router.post("/request-otp")
def request_otp(req: EmailRequest, db: Session = Depends(get_db)):
    normalized_dob = normalize_dob(req.dob)
    if not normalized_dob:
        raise HTTPException(status_code=400, detail="Invalid Date of Birth format")

    user = db.query(User).filter(User.email == req.email).first()
    if user and not user.is_active:
        raise HTTPException(status_code=403, detail="Account locked due to multiple failed login attempts. Contact support.")

    if not user:
        user = User(email=req.email, dob=normalized_dob)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        stored_dob = normalize_dob(user.dob) if user.dob else None
        if stored_dob and stored_dob != normalized_dob:
            raise HTTPException(status_code=400, detail="Invalid Date of Birth")
        elif not user.dob or user.dob != normalized_dob:
            user.dob = normalized_dob
            db.commit()

    otp = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    user.otp = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    try:
        send_otp_email(user.email, otp)
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {"message": "OTP sent to email."}


@router.post("/verify-otp")
def verify_otp(req: OtpVerify, db: Session = Depends(get_db)):
    req_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == req_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid email: {req_email}")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account locked.")

    if user.otp != req.otp or not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.is_active = False
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired OTP. {'Account Locked' if not user.is_active else f'Attempt {user.failed_login_attempts}/5'}",
        )

    has_questions = all([user.sec_q1, user.sec_a1, user.sec_q2, user.sec_a2, user.sec_q3, user.sec_a3])
    questions = [user.sec_q1, user.sec_q2, user.sec_q3] if has_questions else []

    return {
        "otp_valid": True,
        "has_security_questions": has_questions,
        "questions": questions,
    }


@router.post("/setup-security", response_model=Token)
def setup_security(req: SecuritySetupRequest, db: Session = Depends(get_db)):
    req_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == req_email).first()

    if not user or user.otp != req.otp:
        raise HTTPException(status_code=401, detail="Invalid session or OTP expired.")

    user.sec_q1, user.sec_a1 = req.q1, req.a1.lower().strip()
    user.sec_q2, user.sec_a2 = req.q2, req.a2.lower().strip()
    user.sec_q3, user.sec_a3 = req.q3, req.a3.lower().strip()

    db.commit()
    return finalize_login(user, db)


@router.post("/verify-security", response_model=Token)
def verify_security(req: SecurityVerifyRequest, db: Session = Depends(get_db)):
    req_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == req_email).first()
    if not user or user.otp != req.otp:
        raise HTTPException(status_code=401, detail="Invalid session.")

    a1_ok = user.sec_a1 == req.a1.lower().strip()
    a2_ok = user.sec_a2 == req.a2.lower().strip()
    a3_ok = user.sec_a3 == req.a3.lower().strip()

    if not (a1_ok and a2_ok and a3_ok):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.is_active = False
        db.commit()
        raise HTTPException(status_code=401, detail="Incorrect security answers.")

    return finalize_login(user, db, req.country, req.state, req.district)


@router.get("/passkey/status", response_model=PasskeyStatusResponse)
def get_passkey_status(current_user: User = Depends(get_current_user)):
    return PasskeyStatusResponse(passkey_registered=_has_passkey(current_user))


@router.post("/passkey/register/options")
def begin_passkey_registration(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    registration_options = generate_registration_options(
        rp_id=_webauthn_rp_id(),
        rp_name=settings.PROJECT_NAME,
        user_id=str(current_user.id).encode("utf-8"),
        user_name=current_user.email,
        user_display_name=current_user.email,
        authenticator_selection=AuthenticatorSelectionCriteria(
            authenticator_attachment=AuthenticatorAttachment.PLATFORM,
            resident_key=ResidentKeyRequirement.REQUIRED,
            user_verification=UserVerificationRequirement.REQUIRED,
        ),
    )

    current_user.webauthn_challenge = _bytes_to_base64url(registration_options.challenge)
    db.commit()

    return json.loads(options_to_json(registration_options))


@router.post("/passkey/register/verify", response_model=PasskeyStatusResponse)
def finish_passkey_registration(
    req: PasskeyVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.webauthn_challenge:
        raise HTTPException(status_code=400, detail="Passkey registration session expired.")

    try:
        verification = verify_registration_response(
            credential=json.dumps(req.credential),
            expected_challenge=_base64url_to_bytes(current_user.webauthn_challenge),
            expected_rp_id=_webauthn_rp_id(),
            expected_origin=_webauthn_origin(),
            require_user_verification=True,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Passkey registration failed: {exc}") from exc

    current_user.webauthn_credential_id = _bytes_to_base64url(verification.credential_id)
    current_user.webauthn_public_key = _bytes_to_base64url(verification.credential_public_key)
    current_user.webauthn_sign_count = verification.sign_count
    current_user.webauthn_registered_at = datetime.utcnow()
    current_user.webauthn_challenge = None
    db.commit()

    return PasskeyStatusResponse(passkey_registered=True)


@router.post("/passkey/authenticate/options")
def begin_passkey_authentication():
    authentication_options = generate_authentication_options(
        rp_id=_webauthn_rp_id(),
        user_verification=UserVerificationRequirement.REQUIRED,
    )
    challenge = _bytes_to_base64url(authentication_options.challenge)

    return {
        "public_key": json.loads(options_to_json(authentication_options)),
        "challenge_token": _make_passkey_challenge_token(challenge),
    }


@router.post("/passkey/authenticate/verify", response_model=Token)
def finish_passkey_authentication(
    req: PasskeyAuthenticateVerifyRequest,
    db: Session = Depends(get_db),
):
    credential_id = str(req.credential.get("id") or "").strip()
    if not credential_id:
        raise HTTPException(status_code=400, detail="Missing passkey credential ID.")

    challenge = _read_passkey_challenge_token(req.challenge_token)
    user = db.query(User).filter(User.webauthn_credential_id == credential_id).first()
    if not user or not user.webauthn_public_key:
        raise HTTPException(status_code=401, detail="Passkey is not registered for this vault.")

    try:
        verification = verify_authentication_response(
            credential=json.dumps(req.credential),
            expected_challenge=_base64url_to_bytes(challenge),
            expected_rp_id=_webauthn_rp_id(),
            expected_origin=_webauthn_origin(),
            credential_public_key=_base64url_to_bytes(user.webauthn_public_key),
            credential_current_sign_count=user.webauthn_sign_count or 0,
            require_user_verification=True,
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Passkey verification failed: {exc}") from exc

    user.webauthn_sign_count = verification.new_sign_count
    db.commit()
    return finalize_login(user, db)


def finalize_login(user: User, db: Session, country=None, state=None, district=None):
    user.otp = None
    user.otp_expires_at = None
    user.failed_login_attempts = 0
    user.last_login_at = datetime.utcnow()

    login_log = AuditLog(
        user_id=user.id,
        action="login",
        country=country,
        state=state,
        district=district,
    )
    db.add(login_log)
    db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )
    return Token(access_token=access_token)


@router.post("/logout")
def logout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logout_log = AuditLog(user_id=current_user.id, action="logout")
    db.add(logout_log)
    db.commit()
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
