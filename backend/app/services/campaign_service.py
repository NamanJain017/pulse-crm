"""
Campaign Service — orchestrates the full campaign launch lifecycle:
1. Resolve segment → customers
2. Generate per-customer messages (AI)
3. Create Message records
4. Dispatch to channel stub
5. Update campaign status
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.campaign import Campaign
from app.models.message import Message
from app.services.segment_service import execute_segment
from app.services.ai_service import generate_messages_batch
from app.services import channel_client
import asyncio

logger = logging.getLogger(__name__)


async def launch_campaign(campaign_id: str, db: Session) -> Campaign:
    """
    Full campaign launch:
    1. Load campaign + segment
    2. Resolve customer list
    3. Generate AI messages (or apply template)
    4. Insert Message rows
    5. Dispatch to channel stub
    6. Update campaign status + recipient count
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise ValueError(f"Campaign {campaign_id} not found")

    if campaign.status not in ("draft", "failed"):
        raise ValueError(f"Campaign is already {campaign.status}")

    # ── Step 1: Resolve segment ───────────────────────────────────────────────
    if not campaign.segment_id:
        raise ValueError("Campaign has no segment assigned")

    from app.models.segment import Segment
    segment = db.query(Segment).filter(Segment.id == campaign.segment_id).first()
    if not segment:
        raise ValueError("Segment not found")

    customers = execute_segment(segment.rules, db)
    if not customers:
        raise ValueError("Segment matched 0 customers")

    logger.info(f"Campaign {campaign.name}: {len(customers)} customers in segment")

    # ── Step 2: Generate messages ─────────────────────────────────────────────
    campaign.status = "running"
    campaign.launched_at = datetime.now(timezone.utc)
    campaign.total_recipients = len(customers)
    db.commit()

    goal = campaign.nl_brief or campaign.description or campaign.name

    if campaign.personalization_mode == "per_customer":
        customer_dicts = [
            {
                "id": c.id,
                "name": c.name,
                "preferred_cat": c.preferred_cat,
                "days_since_last_order": c.days_since_last_order,
                "tier": c.tier,
                "city": c.city,
                "avg_order_value": float(c.avg_order_value or 0),
            }
            for c in customers
        ]
        try:
            ai_messages = await asyncio.to_thread(
                generate_messages_batch,
                customer_dicts,
                goal,
                campaign.channel
            )
            # Build lookup: customer_id → message content
            msg_lookup = {m["customer_id"]: m["message"] for m in ai_messages}
        except Exception as e:
            logger.error(f"AI message generation failed: {e}")
            # Fallback to template
            msg_lookup = {}
    else:
        msg_lookup = {}

    # ── Step 3: Create Message records + dispatch payload ─────────────────────
    channel_payload = []
    messages_to_insert = []

    for customer in customers:
        external_id = f"MSG-{str(uuid.uuid4())[:12].upper()}"
        cid = str(customer.id)

        # Determine content
        if campaign.personalization_mode == "per_customer" and cid in msg_lookup:
            content = msg_lookup[cid]
        elif campaign.message_template:
            content = campaign.message_template.replace("{name}", customer.name.split()[0])
        else:
            content = f"Hi {customer.name.split()[0]}! Check out KORA's latest. Shop now → kora.in"

        message = Message(
            id=uuid.uuid4(),
            campaign_id=campaign.id,
            customer_id=customer.id,
            channel=campaign.channel,
            content=content,
            status="pending",
            external_id=external_id,
            sent_at=datetime.now(timezone.utc),
        )
        messages_to_insert.append(message)

        channel_payload.append({
            "external_id": external_id,
            "customer_id": cid,
            "channel": campaign.channel,
            "content": content,
            "customer_tier": customer.tier,
            "customer_preferred_channel": customer.preferred_channel,
        })

    db.bulk_save_objects(messages_to_insert)
    campaign.total_sent = len(messages_to_insert)
    db.commit()

    logger.info(f"Created {len(messages_to_insert)} message records")

    # ── Step 4: Dispatch to channel stub (async) ──────────────────────────────
    try:
        await channel_client.dispatch_to_channel(channel_payload)
        logger.info(f"Dispatched {len(channel_payload)} messages to channel stub")
    except Exception as e:
        logger.error(f"Channel dispatch failed: {e}")
        campaign.status = "failed"
        db.commit()
        raise

    return campaign


async def launch_campaign_bg(campaign_id: str):
    """
    Wrapper for launch_campaign to run as a background task with its own db session.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        await launch_campaign(campaign_id, db)
    except Exception as e:
        logger.error(f"Background launch failed for {campaign_id}: {e}")
    finally:
        db.close()



def mark_campaign_completed_if_done(campaign_id: str, db: Session):
    """
    Check if all messages have a terminal status and mark campaign completed.
    Called by the receipt handler after each batch of events.
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign or campaign.status != "running":
        return

    pending = db.query(Message).filter(
        Message.campaign_id == campaign_id,
        Message.status.in_(["pending", "dispatched"])
    ).count()

    if pending == 0:
        campaign.status = "completed"
        campaign.completed_at = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"Campaign {campaign.name} marked completed")
