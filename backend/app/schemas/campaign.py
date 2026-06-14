from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    segment_id: UUID
    channel: str                              # whatsapp / sms / email / rcs
    message_template: Optional[str] = None   # For manual/template campaigns
    personalization_mode: str = "per_customer"
    nl_brief: Optional[str] = None


class CampaignOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    nl_brief: Optional[str] = None
    segment_id: Optional[UUID] = None
    channel: str
    personalization_mode: str
    ai_generated: bool
    status: str
    scheduled_at: Optional[datetime] = None
    launched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_failed: int
    total_opened: int
    total_clicked: int
    total_converted: int
    revenue_attributed: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class CampaignAnalytics(BaseModel):
    campaign: CampaignOut
    delivery_rate: float
    open_rate: float
    click_rate: float
    conversion_rate: float
    revenue_per_message: float
    channel_breakdown: Dict[str, Any]
    ai_insight: Optional[str] = None


class ARIABriefRequest(BaseModel):
    brief: str


class ARIAPlan(BaseModel):
    """ARIA's proposed campaign plan — returned before execution."""
    plan_id: str                     # Temporary ID to reference on approval
    segment_name: str
    segment_rules: Dict[str, Any]
    segment_rationale: str
    customer_count: int
    channel: str
    channel_rationale: str
    timing_suggestion: str
    sample_messages: list            # List of {customer_name, message}
    estimated_open_rate: float
    estimated_revenue_low: float
    estimated_revenue_high: float
