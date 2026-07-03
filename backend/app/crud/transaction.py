import csv
import io
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract, and_
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def list_transactions(
    db: Session,
    user_id: int,
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
    tx_type: Optional[TransactionType] = None,
    category_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    query = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.user_id == user_id)
    )

    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    if tx_type:
        query = query.filter(Transaction.type == tx_type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    total = query.count()
    items = (
        query.order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    import math
    return items, total, math.ceil(total / per_page) if total else 0


def get(db: Session, tx_id: int, user_id: int) -> Optional[Transaction]:
    return (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.id == tx_id, Transaction.user_id == user_id)
        .first()
    )


def create(db: Session, user_id: int, payload: TransactionCreate) -> Transaction:
    tx = Transaction(**payload.model_dump(), user_id=user_id)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return get(db, tx.id, user_id)


def update(db: Session, tx: Transaction, payload: TransactionUpdate) -> Transaction:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx


def delete(db: Session, tx: Transaction) -> None:
    db.delete(tx)
    db.commit()


def export_csv(db: Session, user_id: int) -> str:
    txs = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc())
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Type", "Category", "Amount", "Description"])
    for t in txs:
        writer.writerow([
            t.id,
            t.date.isoformat(),
            t.type.value,
            t.category.name if t.category else "",
            t.amount,
            t.description or "",
        ])
    return output.getvalue()


def monthly_summary(db: Session, user_id: int, year: int, month: int) -> dict:
    rows = (
        db.query(Transaction.type, func.sum(Transaction.amount).label("total"))
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
        .group_by(Transaction.type)
        .all()
    )
    income = next((r.total for r in rows if r.type == TransactionType.income), 0.0)
    expenses = next((r.total for r in rows if r.type == TransactionType.expense), 0.0)
    balance = income - expenses
    savings_rate = round((balance / income * 100), 2) if income > 0 else 0.0
    return {
        "year": year,
        "month": month,
        "total_income": income,
        "total_expenses": expenses,
        "balance": balance,
        "savings_rate": savings_rate,
    }


def category_breakdown(db: Session, user_id: int, year: int, month: int) -> list[dict]:
    rows = (
        db.query(
            Category.name,
            Category.type,
            func.sum(Transaction.amount).label("total"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month,
        )
        .group_by(Category.id, Category.name, Category.type)
        .all()
    )

    expense_total = sum(r.total for r in rows if r.type == TransactionType.expense)
    result = []
    for r in rows:
        pct = round((r.total / expense_total * 100), 2) if r.type == TransactionType.expense and expense_total else 0.0
        result.append({
            "category_name": r.name,
            "category_type": r.type.value,
            "total": r.total,
            "percentage": pct,
        })
    return result


def monthly_trend(db: Session, user_id: int, months: int = 12) -> list[dict]:
    from datetime import date, timedelta
    import calendar

    today = date.today()
    result = []

    for i in range(months - 1, -1, -1):
        year = today.year
        month = today.month - i
        while month <= 0:
            month += 12
            year -= 1

        rows = (
            db.query(Transaction.type, func.sum(Transaction.amount).label("total"))
            .filter(
                Transaction.user_id == user_id,
                extract("year", Transaction.date) == year,
                extract("month", Transaction.date) == month,
            )
            .group_by(Transaction.type)
            .all()
        )
        income = next((r.total for r in rows if r.type == TransactionType.income), 0.0)
        expenses = next((r.total for r in rows if r.type == TransactionType.expense), 0.0)
        result.append({
            "year": year,
            "month": month,
            "label": date(year, month, 1).strftime("%b %Y"),
            "income": income,
            "expenses": expenses,
        })

    return result
