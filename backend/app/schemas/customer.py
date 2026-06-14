from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class CustomerOut(BaseModel):
    id: UUID
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    tier: str
    preferred_cat: Optional[str] = None
    total_orders: int
    total_spend: Decimal
    avg_order_value: Decimal
    last_order_date: Optional[datetime] = None
    days_since_last_order: Optional[int] = None
    preferred_channel: str
    opted_out: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CustomerListOut(BaseModel):
    customers: List[CustomerOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderItemOut(BaseModel):
    id: UUID
    product: str
    category: Optional[str] = None
    quantity: int
    unit_price: Optional[Decimal] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: UUID
    order_number: str
    status: str
    total_amount: Decimal
    channel: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class CustomerDetail(CustomerOut):
    orders: List[OrderOut] = []
