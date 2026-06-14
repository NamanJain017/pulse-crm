import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Message(Base):
    """
    One row per customer per campaign.
    Tracks the full lifecycle of a single communication.
    """
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    channel = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)           # AI-generated per-customer content

    # Lifecycle state — only advances forward (dispatched→delivered→opened→clicked→converted)
    status = Column(String(20), default="pending")
    # pending / dispatched / delivered / failed / opened / clicked / converted

    external_id = Column(String(200), unique=True, nullable=True)  # ID assigned by channel stub
    failed_reason = Column(String(200), nullable=True)

    # Timestamps for each event
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    converted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    campaign = relationship("Campaign", back_populates="messages")
    customer = relationship("Customer", back_populates="messages")
    events = relationship("CommEvent", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message {self.external_id} [{self.status}]>"
