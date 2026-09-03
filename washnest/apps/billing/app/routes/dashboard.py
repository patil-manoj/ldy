from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, Customer, Payment, Expense
from app.schemas import DashboardOut, DailyReportOut

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    total_today = (
        db.query(func.count(Order.id))
        .filter(Order.created_at >= today_start, Order.created_at <= today_end)
        .scalar()
    ) or 0

    revenue_today = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.created_at >= today_start, Order.created_at <= today_end)
        .scalar()
    ) or 0.0

    collected_today = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.received_at >= today_start, Payment.received_at <= today_end)
        .scalar()
    ) or 0.0

    pending_pickups = (
        db.query(func.count(Order.id)).filter(Order.status == "received").scalar()
    ) or 0

    pending_deliveries = (
        db.query(func.count(Order.id)).filter(Order.status == "ready").scalar()
    ) or 0

    in_progress = (
        db.query(func.count(Order.id)).filter(Order.status == "processing").scalar()
    ) or 0

    express_orders = (
        db.query(func.count(Order.id))
        .filter(Order.created_at >= today_start, Order.created_at <= today_end, Order.is_express == True)
        .scalar()
    ) or 0

    total_customers = db.query(func.count(Customer.id)).scalar() or 0

    outstanding_total = (
        db.query(func.coalesce(func.sum(Order.amount_due), 0))
        .filter(Order.payment_status.in_(["unpaid", "partial"]), Order.status != "cancelled")
        .scalar()
    ) or 0.0

    return DashboardOut(
        total_orders_today=total_today,
        revenue_today=float(revenue_today),
        collected_today=float(collected_today),
        pending_pickups=pending_pickups,
        pending_deliveries=pending_deliveries,
        in_progress=in_progress,
        express_orders=express_orders,
        total_customers=total_customers,
        outstanding_total=float(outstanding_total),
    )


@router.get("/reports/daily", response_model=DailyReportOut)
def daily_report(
    report_date: date = Query(default=None),
    db: Session = Depends(get_db),
):
    if not report_date:
        report_date = date.today()

    day_start = datetime.combine(report_date, datetime.min.time())
    day_end = datetime.combine(report_date, datetime.max.time())

    orders = db.query(Order).filter(Order.created_at >= day_start, Order.created_at <= day_end).all()
    payments = db.query(Payment).filter(Payment.received_at >= day_start, Payment.received_at <= day_end).all()
    expenses = db.query(Expense).filter(Expense.date == report_date).all()

    total_revenue = sum(o.total_amount for o in orders)
    collected = sum(p.amount for p in payments)

    cash_collected = sum(p.amount for p in payments if p.mode == "cash")
    upi_collected = sum(p.amount for p in payments if p.mode == "upi")
    card_collected = sum(p.amount for p in payments if p.mode == "card")
    expenses_total = sum(e.amount for e in expenses)

    status_counts: dict[str, int] = {}
    walkin = 0
    whatsapp = 0
    phone = 0
    for o in orders:
        status_counts[o.status] = status_counts.get(o.status, 0) + 1
        if o.source == "walkin":
            walkin += 1
        elif o.source == "whatsapp":
            whatsapp += 1
        else:
            phone += 1

    return DailyReportOut(
        date=report_date.isoformat(),
        total_orders=len(orders),
        walkin_orders=walkin,
        whatsapp_orders=whatsapp,
        phone_orders=phone,
        total_revenue=total_revenue,
        collected_revenue=collected,
        pending_revenue=total_revenue - collected,
        cash_collected=cash_collected,
        upi_collected=upi_collected,
        card_collected=card_collected,
        expenses_total=expenses_total,
        net_revenue=collected - expenses_total,
        orders_by_status=status_counts,
    )
