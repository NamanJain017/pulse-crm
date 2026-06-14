import csv
import io
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerOut, CustomerListOut, CustomerDetail

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", response_model=CustomerListOut)
def list_customers(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    city: Optional[str] = None,
    sort_by: str = Query("total_spend", pattern="^(total_spend|last_order_date|name|days_since_last_order|total_orders)$"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Customer)

    if search:
        q = q.filter(or_(
            Customer.name.ilike(f"%{search}%"),
            Customer.email.ilike(f"%{search}%"),
            Customer.phone.ilike(f"%{search}%"),
        ))
    if tier:
        q = q.filter(Customer.tier == tier)
    if city:
        q = q.filter(Customer.city == city)

    total = q.count()

    sort_col = getattr(Customer, sort_by)
    if sort_dir == "desc":
        sort_col = sort_col.desc()
    q = q.order_by(sort_col)

    customers = q.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size

    return CustomerListOut(
        customers=customers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/export")
def export_customers(db: Session = Depends(get_db)):
    """Export all customers as CSV."""
    customers = db.query(Customer).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "name", "email", "phone", "city", "tier", "preferred_cat",
        "total_orders", "total_spend", "avg_order_value",
        "last_order_date", "days_since_last_order", "preferred_channel", "opted_out"
    ])
    for c in customers:
        writer.writerow([
            c.name, c.email, c.phone, c.city, c.tier, c.preferred_cat,
            c.total_orders, c.total_spend, c.avg_order_value,
            c.last_order_date, c.days_since_last_order, c.preferred_channel, c.opted_out
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kora_customers.csv"}
    )


@router.get("/{customer_id}", response_model=CustomerDetail)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = (
        db.query(Customer)
        .options(joinedload(Customer.orders))
        .filter(Customer.id == customer_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
