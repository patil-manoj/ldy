from __future__ import annotations
import datetime as _dt
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


# ── Customers ────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    name: str
    phone: str
    alt_phone: str | None = None
    address: str | None = None
    landmark: str | None = None
    floor_apt: str | None = None
    area: str | None = None
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    customer_type: str = "regular"
    delivery_notes: str | None = None
    credit_limit: float = 0


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    alt_phone: str | None = None
    address: str | None = None
    landmark: str | None = None
    floor_apt: str | None = None
    area: str | None = None
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    customer_type: str | None = None
    delivery_notes: str | None = None
    credit_limit: float | None = None
    is_active: bool | None = None


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str
    alt_phone: str | None
    address: str | None
    landmark: str | None
    floor_apt: str | None
    area: str | None
    pincode: str | None
    latitude: float | None
    longitude: float | None
    customer_type: str
    delivery_notes: str | None
    credit_limit: float
    total_orders: int
    total_spent: float
    outstanding_balance: float
    is_active: bool
    created_at: datetime
    updated_at: datetime | None


class CustomerBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str
    area: str | None
    total_orders: int


# ── Order Items ──────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    service_type: str
    item_name: str
    category: str | None = None
    quantity: int = 1
    weight_kg: float | None = None
    price_per_unit: float
    subtotal: float
    notes: str | None = None


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: int
    service_type: str
    item_name: str
    category: str | None
    quantity: int
    weight_kg: float | None
    price_per_unit: float
    subtotal: float
    notes: str | None


# ── Orders ───────────────────────────────────────────────────

class OrderCreate(BaseModel):
    customer_id: int
    source: str = "walkin"
    pickup_date: date | None = None
    expected_delivery_date: date | None = None
    pickup_slot: str | None = None
    delivery_slot: str | None = None
    is_express: bool = False
    is_doorstep: bool = True
    weight_kg: float | None = None
    discount_percent: float = 0
    discount_amount: float = 0
    delivery_charge: float = 0
    notes: str | None = None
    staff_notes: str | None = None
    pickup_address: str | None = None
    items: list[OrderItemCreate] = []

    @field_validator("pickup_date", "expected_delivery_date", mode="before")
    @classmethod
    def empty_str_to_none_date(cls, v):
        if v == "" or v is None:
            return None
        return v

    @field_validator("pickup_slot", "delivery_slot", "notes", "staff_notes", "pickup_address", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

    @field_validator("discount_percent", "discount_amount", "delivery_charge", mode="before")
    @classmethod
    def empty_num_to_zero(cls, v):
        if v == "" or v is None:
            return 0
        return v


class OrderUpdate(BaseModel):
    expected_delivery_date: date | None = None
    pickup_slot: str | None = None
    delivery_slot: str | None = None
    is_express: bool | None = None
    discount_percent: float | None = None
    discount_amount: float | None = None
    delivery_charge: float | None = None
    notes: str | None = None
    staff_notes: str | None = None


class StatusUpdate(BaseModel):
    status: str
    changed_by: str | None = None
    notes: str | None = None


class PaymentCreate(BaseModel):
    amount: float
    mode: str  # cash, upi, card
    reference: str | None = None
    received_by: str | None = None
    notes: str | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: int
    amount: float
    mode: str
    reference: str | None
    received_by: str | None
    notes: str | None
    received_at: datetime


class StatusLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: int
    from_status: str | None
    to_status: str
    changed_by: str | None
    notes: str | None
    changed_at: datetime


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    customer_id: int
    customer: CustomerBrief | None = None
    status: str
    source: str
    order_date: date | None
    pickup_date: date | None
    expected_delivery_date: date | None
    actual_delivery_date: date | None
    pickup_slot: str | None
    delivery_slot: str | None
    subtotal: float
    discount_percent: float
    discount_amount: float
    delivery_charge: float
    express_charge: float
    gst_percent: float
    gst_amount: float
    total_amount: float
    payment_status: str
    payment_mode: str | None
    amount_paid: float
    amount_due: float
    is_express: bool
    is_doorstep: bool
    weight_kg: float | None
    notes: str | None
    staff_notes: str | None
    pickup_address: str | None
    created_at: datetime
    updated_at: datetime | None
    items: list[OrderItemOut] = []
    payments: list[PaymentOut] = []
    status_history: list[StatusLogOut] = []


class OrderBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    customer_id: int
    status: str
    source: str
    total_amount: float
    payment_status: str
    is_express: bool
    created_at: datetime


# ── Price List ───────────────────────────────────────────────

class PriceListCreate(BaseModel):
    service_type: str
    item_name: str
    category: str = "clothing"
    price: float
    price_per_kg: float | None = None
    is_per_kg: bool = False
    active: bool = True


class PriceListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    service_type: str
    item_name: str
    category: str | None
    price: float
    price_per_kg: float | None
    is_per_kg: bool
    active: bool


# ── Expenses ─────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    date: _dt.date | None = None
    category: str
    description: str | None = None
    amount: float
    payment_mode: str = "cash"
    reference: str | None = None


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    date: _dt.date
    category: str
    description: str | None
    amount: float
    payment_mode: str
    reference: str | None
    created_at: datetime


# ── Dashboard / Reports ─────────────────────────────────────

class DashboardOut(BaseModel):
    total_orders_today: int
    revenue_today: float
    collected_today: float
    pending_pickups: int
    pending_deliveries: int
    in_progress: int
    express_orders: int
    total_customers: int
    outstanding_total: float


class DailyReportOut(BaseModel):
    date: str
    total_orders: int
    walkin_orders: int
    whatsapp_orders: int
    phone_orders: int
    total_revenue: float
    collected_revenue: float
    pending_revenue: float
    cash_collected: float
    upi_collected: float
    card_collected: float
    expenses_total: float
    net_revenue: float
    orders_by_status: dict[str, int]


# ── Settings ─────────────────────────────────────────────────

class SettingOut(BaseModel):
    key: str
    value: str


class SettingUpdate(BaseModel):
    value: str
