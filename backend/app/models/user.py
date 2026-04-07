from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    otp = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    last_login_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    dob = Column(String, nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    webauthn_challenge = Column(String, nullable=True)
    webauthn_credential_id = Column(String, nullable=True)
    webauthn_public_key = Column(String, nullable=True)
    webauthn_sign_count = Column(Integer, default=0, nullable=False)
    webauthn_registered_at = Column(DateTime, nullable=True)
    
    # 3-Step Security Questions
    sec_q1 = Column(String, nullable=True)
    sec_a1 = Column(String, nullable=True)
    sec_q2 = Column(String, nullable=True)
    sec_a2 = Column(String, nullable=True)
    sec_q3 = Column(String, nullable=True)
    sec_a3 = Column(String, nullable=True)
