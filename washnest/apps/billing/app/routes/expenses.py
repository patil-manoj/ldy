from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Expense
from app.schemas import ExpenseCreate, ExpenseOut

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

VALID_CATEGORIES = {
    "detergent", "rent", "salary", "electricity", "water",
    "packaging", "transport", "maintenance", "equipment", "other",
}


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    if payload.amount <= 0:
        raise HTTPException(status_code=422, detail="Amount must be positive")

    expense = Expense(
        date=payload.date or date.today(),
        category=payload.category,
        description=payload.description,
        amount=payload.amount,
        payment_mode=payload.payment_mode,
        reference=payload.reference,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("", response_model=list[ExpenseOut])
def list_expenses(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    category: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    q = db.query(Expense)
    if date_from:
        q = q.filter(Expense.date >= date_from)
    if date_to:
        q = q.filter(Expense.date <= date_to)
    if category:
        q = q.filter(Expense.category == category)
    return q.order_by(Expense.date.desc(), Expense.created_at.desc()).offset(offset).limit(limit).all()


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
