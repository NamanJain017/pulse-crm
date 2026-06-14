import uuid
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=True)
    city = Column(String(100))
    gender = Column(String(10))           # male / female / other
    age = Column(Integer)

    # CRM tier — auto-computed from spend + recency
    tier = Column(String(20), default="bronze")  # bronze/silver/gold/platinum

    # Behavioural attributes — refreshed on each order
    preferred_cat = Column(String(100))
    total_orders = Column(Integer, default=0)
    total_spend = Column(Numeric(12, 2), default=0)
    avg_order_value = Column(Numeric(10, 2), default=0)
    last_order_date = Column(DateTime(timezone=True), nullable=True)
    days_since_last_order = Column(Integer, nullable=True)

    # Engagement preferences
    preferred_channel = Column(String(20), default="whatsapp")
    opted_out = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="customer")

    def __repr__(self):
        return f"<Customer {self.name} [{self.tier}]>"
