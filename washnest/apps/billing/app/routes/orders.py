import math
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Order, OrderItem, Customer, OrderStatusLog, Setting
from app.schemas import (
    OrderCreate,
    OrderUpdate,
    OrderOut,
    OrderBrief,
    StatusUpdate,
)
from app.config import EXPRESS_MULTIPLIER, GST_ENABLED, GST_RATE

router = APIRouter(prefix="/api/orders", tags=["orders"])

VALID_STATUSES = {"received", "picked_up", "processing", "ready", "out_for_delivery", "delivered", "cancelled"}
VALID_SOURCES = {"walkin", "whatsapp", "phone"}


def round_weight(kg: float) -> float:
    """Round weight to nearest 0.5 kg with 100g grace.

    Rules (Indian laundry standard):
    - Round to nearest 0.5 kg
    - If the weight is ≤100g above the lower 0.5 boundary → round DOWN
    - Otherwise → round UP to next 0.5
    Examples:
      2.0  → 2.0    (exact)
      2.1  → 2.0    (100g grace → round down)
      2.15 → 2.5    (>100g over 2.0 → round up)
      2.3  → 2.5    (>100g over 2.0 → round up)
      2.5  → 2.5    (exact)
      2.6  → 2.5    (100g grace → round down)
      2.65 → 3.0    (>100g over 2.5 → round up)
      2.8  → 3.0    (>100g over 2.5 → round up)
      0.4  → 0.5    (minimum 0.5)
    """
    if kg <= 0:
        return 0.5  # minimum charge
    lower = math.floor(kg * 2) / 2  # nearest 0.5 below
    overshoot = round(kg - lower, 3)  # avoid float artifacts
    if overshoot <= 0.1:  # within 100g grace
        result = lower
    else:
        result = lower + 0.5
    return max(result, 0.5)  # minimum 0.5 kg


def _generate_order_number(db: Session) -> str:
    """Generate sequential order number: WN-2526-0001"""
    setting = db.query(Setting).filter(Setting.key == "financial_year").first()
    fy = setting.value if setting else "2526"

    num_setting = db.query(Setting).filter(Setting.key == "next_order_number").first()
    if num_setting:
        next_num = int(num_setting.value)
        num_setting.value = str(next_num + 1)
    else:
        next_num = 1
        db.add(Setting(key="next_order_number", value="2"))

    return f"WN-{fy}-{next_num:04d}"


def _calculate_totals(order: Order):
    """Recalculate order totals from items and charges."""
    subtotal = sum(item.subtotal for item in order.items)
    order.subtotal = subtotal

    # Express surcharge
    if order.is_express:
        order.express_charge = round(subtotal * (EXPRESS_MULTIPLIER - 1), 2)
    else:
        order.express_charge = 0

    # Discount
    if order.discount_percent > 0:
        order.discount_amount = round(subtotal * order.discount_percent / 100, 2)

    # Pre-tax total
    taxable = subtotal + order.express_charge + order.delivery_charge - order.discount_amount

    # GST
    if GST_ENABLED:
        order.gst_percent = GST_RATE
        order.gst_amount = round(taxable * GST_RATE / 100, 2)
    else:
        order.gst_percent = 0
        order.gst_amount = 0

    order.total_amount = round(taxable + order.gst_amount, 2)
    order.amount_due = round(order.total_amount - order.amount_paid, 2)

    # Payment status
    if order.amount_paid >= order.total_amount:
        order.payment_status = "paid"
    elif order.amount_paid > 0:
        order.payment_status = "partial"
    else:
        order.payment_status = "unpaid"


@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).get(payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    order_number = _generate_order_number(db)

    order = Order(
        order_number=order_number,
        customer_id=payload.customer_id,
        source=payload.source if payload.source in VALID_SOURCES else "walkin",
        pickup_date=payload.pickup_date,
        expected_delivery_date=payload.expected_delivery_date,
        pickup_slot=payload.pickup_slot,
        delivery_slot=payload.delivery_slot,
        is_express=payload.is_express,
        is_doorstep=payload.is_doorstep,
        weight_kg=payload.weight_kg,
        discount_percent=payload.discount_percent,
        discount_amount=payload.discount_amount,
        delivery_charge=payload.delivery_charge,
        notes=payload.notes,
        staff_notes=payload.staff_notes,
        pickup_address=payload.pickup_address,
    )
    db.add(order)
    db.flush()

    # Add items
    for item_data in payload.items:
        item = OrderItem(
            order_id=order.id,
            service_type=item_data.service_type,
            item_name=item_data.item_name,
            category=item_data.category,
            quantity=item_data.quantity,
            weight_kg=item_data.weight_kg,
            price_per_unit=item_data.price_per_unit,
            subtotal=item_data.subtotal,
            notes=item_data.notes,
        )
        db.add(item)

    db.flush()
    db.refresh(order)
    _calculate_totals(order)

    # Log initial status
    db.add(OrderStatusLog(
        order_id=order.id,
        from_status=None,
        to_status="received",
    ))

    # Update customer stats
    customer.total_orders = (customer.total_orders or 0) + 1
    customer.total_spent = (customer.total_spent or 0) + order.total_amount

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(
    status: str | None = Query(None),
    payment_status: str | None = Query(None),
    source: str | None = Query(None),
    is_express: bool | None = Query(None),
    customer_id: int | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    search: str | None = Query(None, description="Search by order number or customer name/phone"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    q = db.query(Order)

    if status:
        q = q.filter(Order.status == status)
    if payment_status:
        q = q.filter(Order.payment_status == payment_status)
    if source:
        q = q.filter(Order.source == source)
    if is_express is not None:
        q = q.filter(Order.is_express == is_express)
    if customer_id:
        q = q.filter(Order.customer_id == customer_id)
    if date_from:
        q = q.filter(Order.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        q = q.filter(Order.created_at <= datetime.combine(date_to, datetime.max.time()))
    if search:
        q = q.join(Customer).filter(
            Order.order_number.ilike(f"%{search}%")
            | Customer.name.ilike(f"%{search}%")
            | Customer.phone.like(f"%{search}%")
        )

    return q.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=OrderOut)
def update_order(order_id: int, payload: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "delivered":
        raise HTTPException(status_code=400, detail="Cannot edit a delivered order")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)

    _calculate_totals(order)
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(order_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {sorted(VALID_STATUSES)}")

    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status

    # Validate transitions
    if old_status == "delivered" and payload.status != "cancelled":
        raise HTTPException(status_code=400, detail="Delivered orders cannot change status")
    if old_status == "cancelled":
        raise HTTPException(status_code=400, detail="Cancelled orders cannot change status")

    order.status = payload.status
    order.updated_at = datetime.utcnow()

    if payload.status == "delivered":
        order.actual_delivery_date = date.today()

    # Log status change
    db.add(OrderStatusLog(
        order_id=order.id,
        from_status=old_status,
        to_status=payload.status,
        changed_by=payload.changed_by,
        notes=payload.notes,
    ))

    db.commit()
    db.refresh(order)
    return order


@router.post("/{order_id}/items", response_model=OrderOut)
def add_items(order_id: int, items: list[dict], db: Session = Depends(get_db)):
    """Add items to an existing order (before delivery)."""
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in ("delivered", "cancelled"):
        raise HTTPException(status_code=400, detail="Cannot modify completed orders")

    for item_data in items:
        item = OrderItem(
            order_id=order.id,
            service_type=item_data["service_type"],
            item_name=item_data["item_name"],
            category=item_data.get("category"),
            quantity=item_data.get("quantity", 1),
            weight_kg=item_data.get("weight_kg"),
            price_per_unit=item_data["price_per_unit"],
            subtotal=item_data["subtotal"],
            notes=item_data.get("notes"),
        )
        db.add(item)

    db.flush()
    db.refresh(order)
    _calculate_totals(order)
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}/items/{item_id}", response_model=OrderOut)
def remove_item(order_id: int, item_id: int, db: Session = Depends(get_db)):
    """Remove an item from an order."""
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in ("delivered", "cancelled"):
        raise HTTPException(status_code=400, detail="Cannot modify completed orders")

    item = db.query(OrderItem).filter(OrderItem.id == item_id, OrderItem.order_id == order_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.flush()
    db.refresh(order)
    _calculate_totals(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/round-weight")
def api_round_weight(kg: float = Query(..., description="Raw weight in kg")):
    """Return the rounded weight for billing purposes."""
    return {"raw": kg, "rounded": round_weight(kg)}
