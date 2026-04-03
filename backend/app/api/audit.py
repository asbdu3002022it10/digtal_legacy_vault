from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.models.nominee import Nominee

router = APIRouter(prefix="/audit", tags=["audit"])

class AuditLogRead(BaseModel):
    id: int
    user_id: int
    action: str
    timestamp: datetime
    ip_address: str | None
    country: str | None
    state: str | None
    district: str | None

    class Config:
        from_attributes = True

@router.get("/logs", response_model=List[AuditLogRead])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Logs for the user
    own_logs = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).all()
    
    # Logs for users where the current user is an activated nominee
    shared_logs = []
    nominee_records = db.query(Nominee).filter(
        Nominee.email == current_user.email,
        Nominee.can_access == True
    ).all()
    
    for rec in nominee_records:
        logs = db.query(AuditLog).filter(AuditLog.user_id == rec.user_id).all()
        shared_logs.extend(logs)
        
    return sorted(own_logs + shared_logs, key=lambda x: x.timestamp, reverse=True)
