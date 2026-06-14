import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.campaign import Campaign
from app.schemas.analytics import DashboardResponse, DashboardStats, ChannelStats, DailyReach
from app.services import analytics_service
from app.services.ai_service import generate_dashboard_insight

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    """All data needed for the dashboard page in one call."""
    stats = analytics_service.get_dashboard_stats(db)
    daily_reach = analytics_service.get_daily_reach(db)
    channel_stats = analytics_service.get_channel_stats(db)

    recent = (
        db.query(Campaign)
        .order_by(Campaign.created_at.desc())
        .limit(5)
        .all()
    )
    recent_campaigns = [
        {
            "id": str(c.id),
            "name": c.name,
            "channel": c.channel,
            "status": c.status,
            "total_recipients": c.total_recipients,
            "total_delivered": c.total_delivered,
            "total_opened": c.total_opened,
            "created_at": c.created_at.isoformat(),
        }
        for c in recent
    ]

    try:
        ai_insight = generate_dashboard_insight(stats)
    except Exception as e:
        logger.warning(f"Dashboard insight failed: {e}")
        ai_insight = f"You have {stats['total_customers']} customers. Top channel: {stats['top_channel'].title()}."

    return DashboardResponse(
        stats=DashboardStats(**stats),
        daily_reach=[DailyReach(**d) for d in daily_reach],
        channel_stats=[ChannelStats(**c) for c in channel_stats],
        recent_campaigns=recent_campaigns,
        ai_insight=ai_insight,
    )
