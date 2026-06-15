import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.campaign import Campaign
from app.models.message import Message
from app.models.event import CommEvent
from app.models.customer import Customer
from app.schemas.campaign import CampaignCreate, CampaignOut, CampaignAnalytics
from app.schemas.message import MessageOut
from app.services import campaign_service, analytics_service
from app.services.ai_service import generate_campaign_insight
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", response_model=list[CampaignOut])
def list_campaigns(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    q = db.query(Campaign)
    if status:
        q = q.filter(Campaign.status == status)
    total = q.count()
    campaigns = q.order_by(Campaign.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return campaigns


@router.post("", response_model=CampaignOut)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(
        id=uuid.uuid4(),
        name=payload.name,
        description=payload.description,
        segment_id=payload.segment_id,
        channel=payload.channel,
        message_template=payload.message_template,
        personalization_mode=payload.personalization_mode,
        nl_brief=payload.nl_brief,
        status="draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/{campaign_id}/launch", response_model=CampaignOut)
async def launch_campaign(
    campaign_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Launch a campaign — queues background task for generation and dispatch."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    try:
        background_tasks.add_task(campaign_service.launch_campaign_bg, campaign_id)
        # Immediately set status to running so frontend reflects it
        campaign.status = "running"
        db.commit()
        db.refresh(campaign)
        return campaign
    except Exception as e:
        logger.error(f"Failed to queue campaign launch: {e}")
        raise HTTPException(status_code=500, detail=f"Launch queue failed: {str(e)}")


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """Delete a campaign and cascade delete its messages and events."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    try:
        db.delete(campaign)
        db.commit()
        return {"status": "deleted", "campaign_id": campaign_id}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete campaign {campaign_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.get("/{campaign_id}/analytics", response_model=CampaignAnalytics)
def get_campaign_analytics(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    metrics = analytics_service.get_campaign_analytics(campaign_id, db)

    # Generate AI insight if campaign is completed
    ai_insight = None
    if campaign.status == "completed":
        stats_for_ai = {
            "name": campaign.name,
            "total_sent": campaign.total_sent,
            "total_delivered": campaign.total_delivered,
            "total_opened": campaign.total_opened,
            "total_clicked": campaign.total_clicked,
            "total_converted": campaign.total_converted,
            "revenue_attributed": float(campaign.revenue_attributed or 0),
            "channel": campaign.channel,
            "delivery_rate": metrics["delivery_rate"],
            "open_rate": metrics["open_rate"],
        }
        try:
            ai_insight = generate_campaign_insight(stats_for_ai)
        except Exception:
            pass

    return CampaignAnalytics(
        campaign=campaign,
        ai_insight=ai_insight,
        **metrics
    )


@router.get("/{campaign_id}/messages")
def get_campaign_messages(
    campaign_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """List all messages for a campaign with customer names joined."""
    messages = (
        db.query(Message, Customer.name)
        .join(Customer, Message.customer_id == Customer.id)
        .filter(Message.campaign_id == campaign_id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    result = []
    for msg, customer_name in messages:
        m = MessageOut.model_validate(msg)
        m.customer_name = customer_name
        result.append(m)

    return result


@router.get("/stream/{campaign_id}")
async def stream_campaign_events(campaign_id: str, db: Session = Depends(get_db)):
    """
    Server-Sent Events stream — pushes real-time delivery events to the frontend.
    """
    async def event_generator():
        last_event_id = None
        consecutive_empty = 0

        while True:
            try:
                q = (
                    db.query(CommEvent, Message.channel, Customer.name)
                    .join(Message, CommEvent.message_id == Message.id)
                    .join(Customer, Message.customer_id == Customer.id)
                    .filter(Message.campaign_id == campaign_id)
                )

                if last_event_id:
                    q = q.filter(CommEvent.id > last_event_id)

                events = q.order_by(CommEvent.received_at).limit(20).all()

                if events:
                    consecutive_empty = 0
                    for evt, channel, cname in events:
                        data = json.dumps({
                            "event_type": evt.event_type,
                            "customer_name": cname,
                            "channel": channel,
                            "received_at": evt.received_at.isoformat(),
                        })
                        yield f"data: {data}\n\n"
                        last_event_id = evt.id

                else:
                    consecutive_empty += 1
                    # Send heartbeat every 5 empty polls
                    if consecutive_empty % 5 == 0:
                        yield f"data: {json.dumps({'event_type': 'heartbeat'})}\n\n"

                # Stop streaming if campaign is done
                campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
                if campaign and campaign.status == "completed" and consecutive_empty > 10:
                    yield f"data: {json.dumps({'event_type': 'stream_end'})}\n\n"
                    break

                await asyncio.sleep(1)

            except Exception as e:
                logger.error(f"SSE stream error: {e}")
                yield f"data: {json.dumps({'event_type': 'error', 'message': str(e)})}\n\n"
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
