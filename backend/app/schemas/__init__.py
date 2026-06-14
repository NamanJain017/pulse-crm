from app.schemas.customer import CustomerOut, CustomerListOut, CustomerDetail
from app.schemas.segment import SegmentCreate, SegmentOut, SegmentPreview
from app.schemas.campaign import CampaignCreate, CampaignOut, CampaignAnalytics
from app.schemas.message import MessageOut
from app.schemas.analytics import DashboardStats, ChannelStats

__all__ = [
    "CustomerOut", "CustomerListOut", "CustomerDetail",
    "SegmentCreate", "SegmentOut", "SegmentPreview",
    "CampaignCreate", "CampaignOut", "CampaignAnalytics",
    "MessageOut",
    "DashboardStats", "ChannelStats",
]
