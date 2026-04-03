from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
import os
import uuid
import shutil
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.security import get_current_user, encrypt_payload, decrypt_payload
from app.db.session import get_db
from app.models.user import User
from app.models.vault import VaultItem
from app.schemas.vault_schema import VaultItemCreate, VaultItemRead, VaultItemUpdate

router = APIRouter(prefix="/vault", tags=["vault"])

from app.models.nominee import Nominee

@router.get("/", response_model=list[VaultItemRead])
def list_vault_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get user's own items
    own_items = db.query(VaultItem).filter(VaultItem.user_id == current_user.id).all()
    
    # Get items where current user is an activated nominee
    shared_items = []
    nominee_records = db.query(Nominee).filter(
        Nominee.email == current_user.email, 
        Nominee.can_access == True
    ).all()
    
    for rec in nominee_records:
        q = db.query(VaultItem).filter(VaultItem.user_id == rec.user_id)
        # Apply category filter if not "all"
        if rec.allowed_categories and rec.allowed_categories.strip().lower() != "all":
            cats = [c.strip() for c in rec.allowed_categories.split(",")]
            q = q.filter(VaultItem.category.in_(cats))
        shared_items.extend(q.all())
        
    return sorted(own_items + shared_items, key=lambda x: x.created_at, reverse=True)

@router.post("/", response_model=VaultItemRead)
def create_vault_item(
    item_in: VaultItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    encrypted = None
    if item_in.payload:
        encrypted = encrypt_payload(item_in.payload)
    
    item = VaultItem(
        user_id=current_user.id,
        title=item_in.title,
        category=item_in.category,
        encrypted_payload=encrypted,
        file_path=item_in.file_path,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.post("/upload")
async def upload_vault_file(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure upload directory exists
    upload_dir = os.path.join("uploads", str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_location = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create vault item
    item = VaultItem(
        user_id=current_user.id,
        title=title,
        category=category,
        file_path=file_location,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/{item_id}", response_model=VaultItemRead)
def get_vault_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(VaultItem).filter(VaultItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Vault item not found")
    
    # Check if owner or activated nominee
    if item.user_id != current_user.id:
        nominee = db.query(Nominee).filter(
            Nominee.user_id == item.user_id,
            Nominee.email == current_user.email,
            Nominee.can_access == True
        ).first()
        if not nominee:
            raise HTTPException(status_code=403, detail="Access denied")
            
    return item

@router.put("/{item_id}", response_model=VaultItemRead)
def update_vault_item(
    item_id: int,
    item_in: VaultItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(VaultItem)
        .filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Vault item not found or permission denied")

    if item_in.title is not None:
        item.title = item_in.title
    if item_in.payload is not None:
        item.encrypted_payload = encrypt_payload(item_in.payload)

    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_vault_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(VaultItem)
        .filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Vault item not found or permission denied")

    if item.file_path and os.path.exists(item.file_path):
        os.remove(item.file_path)

    db.delete(item)
    db.commit()
    return {"ok": True}

@router.get("/{item_id}/download")
def download_vault_file(
    item_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from fastapi.responses import FileResponse
    from app.core.pdf_utils import generate_encrypted_pdf, generate_text_encrypted_pdf
    
    item = db.query(VaultItem).filter(VaultItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Vault item not found")

    # Check ownership or nominee access
    owner = db.query(User).filter(User.id == item.user_id).first()
    if item.user_id != current_user.id:
        # Check if current_user is an activated nominee
        nominee = db.query(Nominee).filter(
            Nominee.user_id == item.user_id,
            Nominee.email == current_user.email,
            Nominee.can_access == True
        ).first()
        if not nominee:
            raise HTTPException(status_code=403, detail="Access denied")
    
    if not owner or not owner.dob:
        raise HTTPException(status_code=400, detail="Owner Date of Birth not set. Cannot generate secure PDF.")

    # Reformat Owner's DOB from YYYY-MM-DD to DDMMYYYY for PDF password
    try:
        formatted_dob = datetime.strptime(owner.dob, "%Y-%m-%d").strftime("%d%m%Y")
    except Exception:
        formatted_dob = owner.dob.replace("-", "")

    temp_pdf_path = f"uploads/{uuid.uuid4()}_secure.pdf"

    if item.file_path:
        if not os.path.exists(item.file_path):
            raise HTTPException(status_code=404, detail="File is missing on server")
        generate_encrypted_pdf(item, formatted_dob, temp_pdf_path)
    elif item.encrypted_payload:
        plaintext = decrypt_payload(item.encrypted_payload)
        generate_text_encrypted_pdf(item.title, plaintext, formatted_dob, temp_pdf_path)
    else:
        raise HTTPException(status_code=400, detail="Vault item has no content to download")

    filename = f"{item.title}_secure.pdf"
    
    def remove_temp_file(path: str):
        if os.path.exists(path) and "_secure.pdf" in path:
            os.remove(path)
            
    background_tasks.add_task(remove_temp_file, temp_pdf_path)

    return FileResponse(
        path=temp_pdf_path, 
        filename=filename, 
        media_type='application/pdf'
    )
