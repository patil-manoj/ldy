from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Payment, Order
from app.schemas import PaymentCreate, PaymentOut

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/{order_id}", response_model=PaymentOut, status_code=201)
def record_payment(order_id: int, payload: PaymentCreate, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot accept payment for cancelled orders")

    if payload.amount <= 0:
        raise HTTPException(status_code=422, detail="Payment amount must be positive")

    if payload.amount > order.amount_due:
        raise HTTPException(status_code=422, detail=f"Payment exceeds amount due (₹{order.amount_due})")

    payment = Payment(
        order_id=order_id,
        amount=payload.amount,
        mode=payload.mode,
        reference=payload.reference,
        received_by=payload.received_by,
        notes=payload.notes,
    )
    db.add(payment)

    # Update order payment totals
    order.amount_paid = round((order.amount_paid or 0) + payload.amount, 2)
    order.amount_due = round(order.total_amount - order.amount_paid, 2)

    if order.amount_paid >= order.total_amount:
        order.payment_status = "paid"
        order.payment_mode = payload.mode
    else:
        order.payment_status = "partial"
        order.payment_mode = "mixed" if order.payment_mode and order.payment_mode != payload.mode else payload.mode

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/{order_id}", response_model=list[PaymentOut])
def list_payments(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db.query(Payment).filter(Payment.order_id == order_id).order_by(Payment.received_at.desc()).all()
