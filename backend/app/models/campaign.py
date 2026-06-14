import uuid
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Campaign(Base):
    """
    A single marketing campaign sent to a segment.

    Stats columns are denormalized (incremented by the receipt handler)
    so the analytics page never needs to COUNT(*) across the messages table.
    """
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    nl_brief = Column(Text)                          # ARIA's original brief

    segment_id = Column(UUID(as_uuid=True), ForeignKey("segments.id", ondelete="SET NULL"), nullable=True)
    channel = Column(String(20), nullable=False)     # whatsapp / sms / email / rcs / mixed

    # Message template (for manual campaigns)
    message_template = Column(Text)
    # per_customer = AI generates individual messages
    # template     = single template with {name} substitution
    personalization_mode = Column(String(20), default="per_customer")

    ai_generated = Column(Boolean, default=False)

    # Lifecycle
    status = Column(String(20), default="draft")
    # draft → running → completed → failed
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    launched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Denormalized stats — incremented atomically by receipt handler
    total_recipients = Column(Integer, default=0)
    total_sent = Column(Integer, default=0)
    total_delivered = Column(Integer, default=0)
    total_failed = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_converted = Column(Integer, default=0)
    revenue_attributed = Column(Numeric(12, 2), default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    segment = relationship("Segment", back_populates="campaigns")
    messages = relationship("Message", back_populates="campaign", cascade="all, delete-orphan")
    attributed_orders = relationship("Order", foreign_keys="Order.attributed_to", back_populates="attributed_campaign")

    def __repr__(self):
        return f"<Campaign '{self.name}' [{self.status}]>"
