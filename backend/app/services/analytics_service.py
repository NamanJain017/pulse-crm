"""
Analytics Service — aggregation queries for dashboard and campaign analytics.
"""
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.models.campaign import Campaign
from app.models.message import Message
from app.models.customer import Customer


def get_dashboard_stats(db: Session) -> Dict[str, Any]:
    """Top-level KPIs for the dashboard header."""
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_campaigns = db.query(func.count(Campaign.id)).scalar() or 0
    active_campaigns = db.query(func.count(Campaign.id)).filter(
        Campaign.status == "running"
    ).scalar() or 0

    # 30-day stats
    msgs_30d = db.query(func.sum(Campaign.total_sent)).filter(
        Campaign.launched_at >= thirty_days_ago
    ).scalar() or 0

    revenue_30d = db.query(func.sum(Campaign.revenue_attributed)).filter(
        Campaign.launched_at >= thirty_days_ago
    ).scalar() or 0

    # Delivery and open rates across all completed campaigns
    stats = db.query(
        func.sum(Campaign.total_sent).label("sent"),
        func.sum(Campaign.total_delivered).label("delivered"),
        func.sum(Campaign.total_opened).label("opened"),
    ).filter(Campaign.total_sent > 0).first()

    total_sent = stats.sent or 1
    avg_delivery = round((stats.delivered or 0) / total_sent, 4)
    avg_open = round((stats.opened or 0) / max(stats.delivered or 1, 1), 4)

    # Top channel
    top_channel_row = db.query(
        Campaign.channel, func.count(Campaign.id).label("cnt")
    ).group_by(Campaign.channel).order_by(func.count(Campaign.id).desc()).first()
    top_channel = top_channel_row.channel if top_channel_row else "whatsapp"

    return {
        "total_customers": total_customers,
        "total_campaigns": total_campaigns,
        "messages_sent_30d": int(msgs_30d),
        "revenue_attributed_30d": float(revenue_30d or 0),
        "avg_delivery_rate": avg_delivery,
        "avg_open_rate": avg_open,
        "top_channel": top_channel,
        "active_campaigns": active_campaigns,
    }


def get_daily_reach(db: Session, days: int = 30) -> List[Dict[str, Any]]:
    """Daily messages sent/delivered/opened for the reach bar chart."""
    result = db.execute(text("""
        SELECT
            DATE(launched_at AT TIME ZONE 'UTC') AS day,
            SUM(total_sent) AS messages_sent,
            SUM(total_delivered) AS delivered,
            SUM(total_opened) AS opened
        FROM campaigns
        WHERE launched_at >= NOW() - INTERVAL ':days days'
          AND total_sent > 0
        GROUP BY day
        ORDER BY day
    """), {"days": days})

    rows = result.fetchall()
    return [
        {
            "date": str(row.day),
            "messages_sent": int(row.messages_sent or 0),
            "delivered": int(row.delivered or 0),
            "opened": int(row.opened or 0),
        }
        for row in rows
    ]


def get_channel_stats(db: Session) -> List[Dict[str, Any]]:
    """Per-channel aggregated performance across all campaigns."""
    rows = db.query(
        Campaign.channel,
        func.sum(Campaign.total_sent).label("total_sent"),
        func.sum(Campaign.total_delivered).label("total_delivered"),
        func.sum(Campaign.total_opened).label("total_opened"),
        func.sum(Campaign.total_clicked).label("total_clicked"),
        func.sum(Campaign.total_converted).label("total_converted"),
    ).filter(Campaign.total_sent > 0).group_by(Campaign.channel).all()

    result = []
    for row in rows:
        sent = row.total_sent or 1
        delivered = row.total_delivered or 0
        opened = row.total_opened or 0
        clicked = row.total_clicked or 0
        converted = row.total_converted or 0

        result.append({
            "channel": row.channel,
            "total_sent": int(sent),
            "delivery_rate": round(delivered / sent, 4),
            "open_rate": round(opened / max(delivered, 1), 4),
            "click_rate": round(clicked / max(opened, 1), 4),
            "conversion_rate": round(converted / max(clicked, 1), 4),
        })

    return result


def get_campaign_analytics(campaign_id: str, db: Session) -> Dict[str, Any]:
    """Full analytics breakdown for a single campaign."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise ValueError("Campaign not found")

    sent = campaign.total_sent or 1
    delivered = campaign.total_delivered or 0
    opened = campaign.total_opened or 0
    clicked = campaign.total_clicked or 0
    converted = campaign.total_converted or 0

    return {
        "delivery_rate": round(delivered / sent, 4),
        "open_rate": round(opened / max(delivered, 1), 4),
        "click_rate": round(clicked / max(opened, 1), 4),
        "conversion_rate": round(converted / max(clicked, 1), 4),
        "revenue_per_message": round(float(campaign.revenue_attributed or 0) / sent, 2),
        "channel_breakdown": {
            campaign.channel: {
                "sent": campaign.total_sent,
                "delivered": campaign.total_delivered,
                "opened": campaign.total_opened,
                "clicked": campaign.total_clicked,
                "converted": campaign.total_converted,
            }
        }
    }
