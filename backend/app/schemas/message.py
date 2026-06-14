from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class MessageOut(BaseModel):
    id: UUID
    campaign_id: UUID
    customer_id: UUID
    customer_name: Optional[str] = None   # Joined from customer
    channel: str
    content: str
    status: str
    external_id: Optional[str] = None
    failed_reason: Optional[str] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    converted_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReceiptPayload(BaseModel):
    """Payload received from channel stub callbacks."""
    external_id: str
    event_type: str    # dispatched / delivered / failed / opened / clicked / converted
    idempotency_key: str
    event_data: Optional[dict] = None   # e.g. {"order_amount": 3500, "reason": "invalid_number"}
