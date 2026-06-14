from pydantic import BaseModel
from typing import List, Optional


class IncomingMessage(BaseModel):
    """One message dispatched by the CRM."""
    external_id: str
    customer_id: str
    channel: str                          # whatsapp / sms / email / rcs
    content: str
    customer_tier: str = "silver"         # bronze / silver / gold / platinum
    customer_preferred_channel: str = "whatsapp"


class SendRequest(BaseModel):
    messages: List[IncomingMessage]


class SendResponse(BaseModel):
    accepted: int
    rejected: int = 0


class ReceiptCallback(BaseModel):
    """Payload sent back to the CRM's /receipts endpoint."""
    external_id: str
    event_type: str                       # dispatched / delivered / failed / opened / clicked / converted
    idempotency_key: str
    event_data: Optional[dict] = None
