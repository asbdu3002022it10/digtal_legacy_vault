from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr


class NomineeCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    relationship: Optional[str] = None
    allowed_categories: Optional[str] = None   # e.g. "bank,document,media" or "all"
    instructions: Optional[str] = None


class NomineeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    allowed_categories: Optional[str] = None
    instructions: Optional[str] = None


# Keep backward compat alias
class NomineeUpsert(NomineeCreate):
    pass


class NomineeRead(BaseModel):
    id: int
    user_id: int
    name: Optional[str]
    email: str
    phone: Optional[str]
    relationship: Optional[str]
    can_access: bool
    status: str
    allowed_categories: Optional[str]
    instructions: Optional[str]
    accepted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
