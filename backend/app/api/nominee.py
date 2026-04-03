import secrets
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.email import send_otp_email
from app.db.session import get_db
from app.models.nominee import Nominee
from app.models.user import User
from app.schemas.nominee_schema import NomineeCreate, NomineeUpdate, NomineeRead
from app.core.config import get_settings


router = APIRouter(prefix="/nominee", tags=["nominee"])
settings = get_settings()


# ── List all nominees (supports multiple) ──────────────────────────────────
@router.get("/", response_model=List[NomineeRead])
def get_nominees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    nominees = (
        db.query(Nominee)
        .filter(Nominee.user_id == current_user.id)
        .order_by(Nominee.created_at.asc())
        .all()
    )
    return nominees


# ── Add a new nominee ──────────────────────────────────────────────────────
@router.post("/", response_model=NomineeRead)
def add_nominee(
    nominee_in: NomineeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if this email is already a nominee for this user
    existing = db.query(Nominee).filter(
        Nominee.user_id == current_user.id,
        Nominee.email == nominee_in.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email is already a nominee.")

    # Generate acceptance token
    accept_token = secrets.token_urlsafe(32)

    nominee = Nominee(
        user_id=current_user.id,
        name=nominee_in.name,
        email=nominee_in.email,
        phone=nominee_in.phone,
        relationship=nominee_in.relationship,
        allowed_categories=nominee_in.allowed_categories or "all",
        instructions=nominee_in.instructions,
        acceptance_token=accept_token,
        status="pending",
    )
    db.add(nominee)
    db.commit()
    db.refresh(nominee)

    # Send acceptance email to nominee
    user_name = current_user.email.split("@")[0]
    accept_link = f"{settings.FRONTEND_URL}/nominee-accept/{accept_token}"
    message = (
        f"Hello {nominee_in.name or nominee_in.email},\n\n"
        f"You have been designated as a trusted nominee by {current_user.email} "
        f"in their Digital Legacy Vault.\n\n"
        f"Please click the link below to accept this responsibility:\n"
        f"{accept_link}\n\n"
        f"If you did not expect this email, you can safely ignore it.\n\n"
        f"Note: You will gain access to their vault only if they are inactive for a prolonged period."
    )
    try:
        send_otp_email(nominee_in.email, message)
    except Exception as e:
        print(f"Email send failed: {e}")

    return nominee


# ── Update a nominee ───────────────────────────────────────────────────────
@router.put("/{nominee_id}", response_model=NomineeRead)
def update_nominee(
    nominee_id: int,
    nominee_in: NomineeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    nominee = db.query(Nominee).filter(
        Nominee.id == nominee_id,
        Nominee.user_id == current_user.id
    ).first()
    if not nominee:
        raise HTTPException(status_code=404, detail="Nominee not found")

    for field, value in nominee_in.model_dump(exclude_unset=True).items():
        setattr(nominee, field, value)

    db.commit()
    db.refresh(nominee)
    return nominee


# ── Delete a nominee ───────────────────────────────────────────────────────
@router.delete("/{nominee_id}")
def delete_nominee(
    nominee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    nominee = db.query(Nominee).filter(
        Nominee.id == nominee_id,
        Nominee.user_id == current_user.id
    ).first()
    if not nominee:
        raise HTTPException(status_code=404, detail="Nominee not found")
    db.delete(nominee)
    db.commit()
    return {"ok": True}


# ── Nominee accepts via token link ─────────────────────────────────────────
@router.post("/accept/{token}")
def accept_nominee_invitation(token: str, db: Session = Depends(get_db)):
    nominee = db.query(Nominee).filter(Nominee.acceptance_token == token).first()
    if not nominee:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation link")

    nominee.status = "accepted"
    nominee.accepted_at = datetime.utcnow()
    nominee.acceptance_token = None   # Invalidate token after use
    db.commit()
    return {"message": "You have accepted the nominee invitation. You will receive access when needed."}


# ── Vault access with category filter ─────────────────────────────────────
@router.get("/access/{token}")
def nominee_access_stub(token: str, db: Session = Depends(get_db)):
    # Check nominee
    nominee = db.query(Nominee).filter(
        Nominee.acceptance_token == token, 
        Nominee.can_access == True
    ).first()
    if not nominee:
        raise HTTPException(status_code=403, detail="Access denied or token invalid")
    return {
        "message": "Nominee access granted",
        "allowed_categories": nominee.allowed_categories,
        "instructions": nominee.instructions,
    }
