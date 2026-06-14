from pydantic import BaseModel
from typing import List, Dict, Any


class DashboardStats(BaseModel):
    total_customers: int
    total_campaigns: int
    messages_sent_30d: int
    revenue_attributed_30d: float
    avg_delivery_rate: float
    avg_open_rate: float
    top_channel: str
    active_campaigns: int


class ChannelStats(BaseModel):
    channel: str
    total_sent: int
    delivery_rate: float
    open_rate: float
    click_rate: float
    conversion_rate: float


class DailyReach(BaseModel):
    date: str
    messages_sent: int
    delivered: int
    opened: int


class DashboardResponse(BaseModel):
    stats: DashboardStats
    daily_reach: List[DailyReach]
    channel_stats: List[ChannelStats]
    recent_campaigns: List[Dict[str, Any]]
    ai_insight: str
