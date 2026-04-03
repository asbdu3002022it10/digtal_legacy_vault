from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VaultItemBase(BaseModel):
    title: str
    category: str = "general"
    payload: Optional[str] = None
    file_path: Optional[str] = None


class VaultItemCreate(VaultItemBase):
    pass


class VaultItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    payload: Optional[str] = None
    file_path: Optional[str] = None


class VaultItemRead(BaseModel):
    id: int
    title: str
    category: str
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

