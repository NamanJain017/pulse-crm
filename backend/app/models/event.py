import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base

JSONType = JSONB().with_variant(JSON(), "sqlite")


class CommEvent(Base):
    """
    Immutable log of every callback received from the channel stub.
    The idempotency_key prevents double-processing if the stub retries.
    """
    __tablename__ = "comm_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String(200))                 # Channel stub's message ID
    event_type = Column(String(30), nullable=False)
    # dispatched / delivered / failed / opened / clicked / converted
    event_data = Column(JSONType)                     # Extra payload (e.g. order_amount on converted)
    idempotency_key = Column(String(200), unique=True, nullable=False)  # Prevents double-processing
    received_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("Message", back_populates="events")

    def __repr__(self):
        return f"<CommEvent {self.event_type} for {self.external_id}>"
