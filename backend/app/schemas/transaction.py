from pydantic import BaseModel, field_validator
import datetime as _dt
from typing import Optional
from app.models.transaction import TransactionType
from app.schemas.category import CategoryOut


class TransactionCreate(BaseModel):
    category_id: int
    amount: float
    type: TransactionType
    description: Optional[str] = None
    date: _dt.date

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    description: Optional[str] = None
    date: Optional[_dt.date] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


class TransactionOut(BaseModel):
    id: int
    user_id: int
    category_id: Optional[int] = None
    category: Optional[CategoryOut] = None
    amount: float
    type: TransactionType
    description: Optional[str] = None
    date: _dt.date
    created_at: _dt.datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    items: list[TransactionOut]
    total: int
    page: int
    per_page: int
    total_pages: int
