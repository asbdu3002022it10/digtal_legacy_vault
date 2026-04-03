from datetime import datetime
import secrets

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean, Text

from app.db.base import Base


class Nominee(Base):
    __tablename__ = "nominees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=True)              # Nominee's full name
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    relationship = Column(String, nullable=True)      # e.g. Wife, Father, Friend
    can_access = Column(Boolean, default=False, nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending, accepted, activated
    acceptance_token = Column(String, nullable=True)  # Token sent via email for acceptance
    allowed_categories = Column(String, nullable=True)  # comma-separated: "bank,document,media"
    instructions = Column(Text, nullable=True)        # Personal note/instruction
    accepted_at = Column(DateTime, nullable=True)     # When nominee accepted
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
