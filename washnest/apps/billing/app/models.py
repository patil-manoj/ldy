from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    Text,
    Float,
    DateTime,
    Date,
    ForeignKey,
    Index,
    CheckConstraint,
    Boolean,
    event,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ── Customers ────────────────────────────────────────────────

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    phone = Column(Text, unique=True, nullable=False, index=True)
    alt_phone = Column(Text)
    address = Column(Text)
    landmark = Column(Text)
    floor_apt = Column(Text)  # floor / apartment / house number
    area = Column(Text)
    pincode = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    customer_type = Column(Text, default="regular")  # regular, walkin, corporate
    delivery_notes = Column(Text)  # "ring bell", "watchman", etc.
    credit_limit = Column(Float, default=0)  # for monthly billing customers
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0)
    outstanding_balance = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    orders = relationship("Order", back_populates="customer", lazy="selectin")


# ── Orders ───────────────────────────────────────────────────

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_status", "status"),
        Index("ix_orders_created", "created_at"),
        Index("ix_orders_customer", "customer_id"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_number = Column(Text, unique=True, nullable=False)  # WN-2526-0001
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    # Status & source
    status = Column(Text, default="received")
    # received → picked_up → processing → ready → out_for_delivery → delivered → cancelled
    source = Column(Text, default="walkin")  # walkin, whatsapp, phone

    # Dates
    order_date = Column(Date, default=date.today)
    pickup_date = Column(Date)
    expected_delivery_date = Column(Date)
    actual_delivery_date = Column(Date)
    pickup_slot = Column(Text)  # morning, afternoon, evening
    delivery_slot = Column(Text)

    # Pricing
    subtotal = Column(Float, default=0)
    discount_percent = Column(Float, default=0)
    discount_amount = Column(Float, default=0)
    delivery_charge = Column(Float, default=0)
    express_charge = Column(Float, default=0)  # rush/express surcharge
    gst_percent = Column(Float, default=0)  # 18% when applicable
    gst_amount = Column(Float, default=0)
    total_amount = Column(Float, default=0)

    # Payment
    payment_status = Column(Text, default="unpaid")  # unpaid, partial, paid
    payment_mode = Column(Text)  # cash, upi, card, credit, mixed
    amount_paid = Column(Float, default=0)
    amount_due = Column(Float, default=0)

    # Flags
    is_express = Column(Boolean, default=False)  # express/urgent order
    is_doorstep = Column(Boolean, default=True)  # pickup from door vs drop-off
    weight_kg = Column(Float)  # for weight-based orders

    # Notes
    notes = Column(Text)  # customer-facing notes
    staff_notes = Column(Text)  # internal notes
    pickup_address = Column(Text)  # if different from customer address

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", lazy="selectin", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", lazy="selectin", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusLog", back_populates="order", lazy="selectin", cascade="all, delete-orphan")


# ── Order Items ──────────────────────────────────────────────

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    service_type = Column(Text, nullable=False)  # wash_fold, iron, wash_iron, dry_clean
    item_name = Column(Text, nullable=False)
    category = Column(Text)  # clothing, bedding, household
    quantity = Column(Integer, default=1)
    weight_kg = Column(Float)  # for per-kg items
    price_per_unit = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    notes = Column(Text)  # "stain on collar", "missing button"

    order = relationship("Order", back_populates="items")


# ── Payments ─────────────────────────────────────────────────

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Float, nullable=False)
    mode = Column(Text, nullable=False)  # cash, upi, card
    reference = Column(Text)  # UPI transaction ID / card last 4
    received_by = Column(Text)  # staff name
    notes = Column(Text)
    received_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payments")


# ── Order Status Log ─────────────────────────────────────────

class OrderStatusLog(Base):
    __tablename__ = "order_status_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    from_status = Column(Text)
    to_status = Column(Text, nullable=False)
    changed_by = Column(Text)  # staff name
    notes = Column(Text)
    changed_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="status_history")


# ── Price List ───────────────────────────────────────────────

class PriceList(Base):
    __tablename__ = "price_list"

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_type = Column(Text, nullable=False)
    item_name = Column(Text, nullable=False)
    category = Column(Text, default="clothing")  # clothing, bedding, household, accessories
    price = Column(Float, nullable=False)
    price_per_kg = Column(Float)  # alternative weight-based pricing
    is_per_kg = Column(Boolean, default=False)
    active = Column(Boolean, default=True)


# ── Expenses ─────────────────────────────────────────────────

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, default=date.today)
    category = Column(Text, nullable=False)
    # detergent, rent, salary, electricity, packaging, transport, maintenance, other
    description = Column(Text)
    amount = Column(Float, nullable=False)
    payment_mode = Column(Text, default="cash")  # cash, upi, card
    reference = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# ── App Settings ─────────────────────────────────────────────

class Setting(Base):
    __tablename__ = "settings"

    key = Column(Text, primary_key=True)
    value = Column(Text, nullable=False)
    # Keys: shop_name, phone, gst_number, gst_enabled, address,
    #        min_order_value, express_multiplier, delivery_charge_default,
    #        next_order_number, financial_year
