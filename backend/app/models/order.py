import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default="completed")   # completed / returned / cancelled
    total_amount = Column(Numeric(12, 2), nullable=False)
    channel = Column(String(20))                        # online / offline / app

    # Revenue attribution — set when a conversion callback arrives
    attributed_to = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    attributed_campaign = relationship("Campaign", foreign_keys=[attributed_to], back_populates="attributed_orders")

    def __repr__(self):
        return f"<Order {self.order_number} ₹{self.total_amount}>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product = Column(String(200), nullable=False)
    category = Column(String(100))
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="items")
