from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Customer
from app.schemas import CustomerCreate, CustomerUpdate, CustomerOut, CustomerBrief

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == payload.phone).first()
    if existing:
        raise HTTPException(status_code=409, detail="Customer with this phone already exists")
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerOut])
def list_customers(
    search: str | None = Query(None, description="Search by name, phone, or area"),
    customer_type: str | None = Query(None),
    is_active: bool | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    q = db.query(Customer)

    if search:
        q = q.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.phone.like(f"%{search}%"),
                Customer.area.ilike(f"%{search}%"),
            )
        )
    if customer_type:
        q = q.filter(Customer.customer_type == customer_type)
    if is_active is not None:
        q = q.filter(Customer.is_active == is_active)

    return q.order_by(Customer.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/lookup")
def lookup_customer(phone: str = Query(...), db: Session = Depends(get_db)):
    """Quick lookup by exact phone — used during order creation."""
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if not customer:
        return None
    return CustomerOut.model_validate(customer)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}/orders")
def customer_orders(customer_id: int, db: Session = Depends(get_db)):
    from app.models import Order
    from app.schemas import OrderOut

    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    orders = (
        db.query(Order)
        .filter(Order.customer_id == customer_id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderOut.model_validate(o) for o in orders]
