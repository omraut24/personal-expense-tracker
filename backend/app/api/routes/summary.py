from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.crud import transaction as tx_crud
from app.schemas.summary import MonthlySummary, CategoryBreakdown, MonthlyTrend

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/monthly", response_model=MonthlySummary)
def monthly_summary(
    year: int = Query(default=None),
    month: int = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    year = year or today.year
    month = month or today.month
    data = tx_crud.monthly_summary(db, current_user.id, year, month)
    return MonthlySummary(**data)


@router.get("/by-category", response_model=list[CategoryBreakdown])
def by_category(
    year: int = Query(default=None),
    month: int = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    year = year or today.year
    month = month or today.month
    rows = tx_crud.category_breakdown(db, current_user.id, year, month)
    return [CategoryBreakdown(**r) for r in rows]


@router.get("/trend", response_model=list[MonthlyTrend])
def trend(
    months: int = Query(default=12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = tx_crud.monthly_trend(db, current_user.id, months)
    return [MonthlyTrend(**r) for r in rows]
