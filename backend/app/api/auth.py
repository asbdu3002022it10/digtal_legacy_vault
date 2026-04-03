import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, get_current_user
from app.core.email import EmailDeliveryError, send_otp_email
from app.db.session import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.user_schema import UserRead, Token


router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def normalize_dob(value: str) -> str | None:
    raw = value.strip()
    for fmt in ("%Y-%m-%d", "%d%m%Y", "%d-%m-%Y", "%d/%m/%Y", "%Y%m%d"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

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

@router.post("/request-otp")
def request_otp(req: EmailRequest, db: Session = Depends(get_db)):
    normalized_dob = normalize_dob(req.dob)
    if not normalized_dob:
        raise HTTPException(status_code=400, detail="Invalid Date of Birth format")

    user = db.query(User).filter(User.email == req.email).first()
    if user and not user.is_active:
        raise HTTPException(status_code=403, detail="Account locked due to multiple failed login attempts. Contact support.")

    if not user:
        # Auto-register if user doesn't exist
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

    # Generate 6-digit OTP
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
    # Normalize email
    req_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == req_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid email: {req_email}")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account locked.")

    # Check OTP and Expiry
    if user.otp != req.otp or not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.is_active = False
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired OTP. {'Account Locked' if not user.is_active else f'Attempt {user.failed_login_attempts}/5'}",
        )

    # Don't clear OTP yet - we need it to verify security questions!
    has_questions = all([user.sec_q1, user.sec_a1, user.sec_q2, user.sec_a2, user.sec_q3, user.sec_a3])
    questions = [user.sec_q1, user.sec_q2, user.sec_q3] if has_questions else []

    print(f"DEBUG: verify-otp success for {req_email}, has_questions: {has_questions}")

    return {
        "otp_valid": True,
        "has_security_questions": has_questions,
        "questions": questions
    }

@router.post("/setup-security", response_model=Token)
def setup_security(req: SecuritySetupRequest, db: Session = Depends(get_db)):
    req_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == req_email).first()
    # Debug log to see why it might fail
    print(f"DEBUG: setup-security for {req_email}. DB OTP: {user.otp if user else 'No User'}, Req OTP: {req.otp}")
    
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

    # Verify all 3 answers (case insensitive, trimmed)
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

def finalize_login(user: User, db: Session, country=None, state=None, district=None):
    # Clear OTP after successful use and update activity
    user.otp = None
    user.otp_expires_at = None
    user.failed_login_attempts = 0
    user.last_login_at = datetime.utcnow()
    
    # Audit log with location
    login_log = AuditLog(
        user_id=user.id, 
        action="login",
        country=country,
        state=state,
        district=district
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
    current_user: User = Depends(get_current_user)
):
    logout_log = AuditLog(user_id=current_user.id, action="logout")
    db.add(logout_log)
    db.commit()
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

