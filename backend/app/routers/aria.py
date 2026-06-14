"""
ARIA Router — the AI campaign intelligence agent.

Flow:
1. POST /aria/brief         → Returns a plan (segment + messages + estimates), NOT executed
2. POST /aria/approve        → Creates the segment + campaign and launches it
"""
import uuid
import logging
import time
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.segment import Segment
from app.models.campaign import Campaign
from app.models.customer import Customer
from app.schemas.campaign import ARIABriefRequest, ARIAPlan
from app.services import segment_service, campaign_service
from app.services.ai_service import orchestrate_aria_brief, generate_dashboard_insight

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory plan cache — plan_id → plan data
# For a production system this would be Redis with TTL.
_PLAN_CACHE: Dict[str, dict] = {}
_PLAN_TTL_SECONDS = 1800  # 30 minutes


def _cleanup_old_plans():
    now = time.time()
    expired = [pid for pid, p in _PLAN_CACHE.items() if now - p["_created_at"] > _PLAN_TTL_SECONDS]
    for pid in expired:
        del _PLAN_CACHE[pid]


@router.post("/brief", response_model=ARIAPlan)
def process_brief(payload: ARIABriefRequest, db: Session = Depends(get_db)):
    """
    Process a natural-language campaign brief.
    Returns a full plan for human review — does NOT create or launch anything yet.
    """
    _cleanup_old_plans()

    if not payload.brief or len(payload.brief.strip()) < 10:
        raise HTTPException(status_code=400, detail="Brief is too short. Describe your campaign goal in a sentence or two.")

    try:
        from app.services.ai_service import parse_segment_brief
        segment_data = parse_segment_brief(payload.brief)
    except Exception as e:
        logger.error(f"ARIA brief parsing failed: {e}")
        raise HTTPException(status_code=500, detail=f"ARIA couldn't process this brief: {str(e)}")

    # Count matched customers
    customer_count = segment_service.count_segment(segment_data["rules"], db)

    if customer_count == 0:
        raise HTTPException(
            status_code=400,
            detail="This brief matches 0 customers. Try broadening your criteria (e.g. lower the spend threshold or extend the time window)."
        )

    # Get sample customers for message preview
    sample_customers = segment_service.preview_segment(segment_data["rules"], db, limit=3)

    # Get average order value across matched customers for revenue estimates
    avg_ov = db.query(func.avg(Customer.avg_order_value)).filter(
        Customer.id.in_([c["id"] for c in sample_customers])
    ).scalar() or 2500

    # Run full orchestration (sample messages + revenue estimates)
    try:
        plan_data = orchestrate_aria_brief(
            brief=payload.brief,
            customer_count=customer_count,
            sample_customers=sample_customers,
            avg_order_value=float(avg_ov),
        )
    except Exception as e:
        logger.error(f"ARIA orchestration failed: {e}")
        raise HTTPException(status_code=500, detail=f"ARIA failed to build a plan: {str(e)}")

    plan_id = str(uuid.uuid4())
    _PLAN_CACHE[plan_id] = {
        "_created_at": time.time(),
        "brief": payload.brief,
        "segment_rules": plan_data["segment_rules"],
        "segment_name": plan_data["segment_name"],
        "channel": plan_data["channel"],
    }

    return ARIAPlan(
        plan_id=plan_id,
        segment_name=plan_data["segment_name"],
        segment_rules=plan_data["segment_rules"],
        segment_rationale=plan_data["segment_rationale"],
        customer_count=customer_count,
        channel=plan_data["channel"],
        channel_rationale=plan_data["channel_rationale"],
        timing_suggestion=plan_data["timing_suggestion"],
        sample_messages=plan_data["sample_messages"],
        estimated_open_rate=plan_data["estimated_open_rate"],
        estimated_revenue_low=plan_data["estimated_revenue_low"],
        estimated_revenue_high=plan_data["estimated_revenue_high"],
    )


@router.post("/approve/{plan_id}")
async def approve_plan(plan_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Approve a previously generated ARIA plan.
    Creates the Segment + Campaign records and launches the campaign.
    """
    _cleanup_old_plans()

    plan = _PLAN_CACHE.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found or expired. Please generate a new plan.")

    # Create segment
    count = segment_service.count_segment(plan["segment_rules"], db)
    segment = Segment(
        id=uuid.uuid4(),
        name=plan["segment_name"],
        description=f"Created by ARIA from brief: {plan['brief'][:200]}",
        rules=plan["segment_rules"],
        nl_brief=plan["brief"],
        ai_rationale=plan["brief"],
        created_by="aria",
        customer_count=count,
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)

    # Create campaign
    campaign = Campaign(
        id=uuid.uuid4(),
        name=plan["segment_name"],
        description=f"ARIA campaign: {plan['brief'][:200]}",
        nl_brief=plan["brief"],
        segment_id=segment.id,
        channel=plan["channel"],
        personalization_mode="per_customer",
        ai_generated=True,
        status="draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # Launch immediately
    try:
        await campaign_service.launch_campaign(str(campaign.id), db)
    except Exception as e:
        logger.error(f"ARIA campaign launch failed: {e}")
        raise HTTPException(status_code=500, detail=f"Campaign created but launch failed: {str(e)}")

    # Remove plan from cache
    del _PLAN_CACHE[plan_id]

    db.refresh(campaign)
    return {
        "status": "launched",
        "campaign_id": str(campaign.id),
        "segment_id": str(segment.id),
        "total_recipients": campaign.total_recipients,
    }


@router.get("/insights")
def get_ai_insights(db: Session = Depends(get_db)):
    """Generate a dashboard-level AI insight based on overall stats."""
    from app.services.analytics_service import get_dashboard_stats
    stats = get_dashboard_stats(db)
    try:
        insight = generate_dashboard_insight(stats)
    except Exception as e:
        logger.warning(f"Dashboard insight generation failed: {e}")
        insight = f"You have {stats['total_customers']} customers across {stats['total_campaigns']} campaigns. Your top channel is {stats['top_channel']}."
    return {"insight": insight}
