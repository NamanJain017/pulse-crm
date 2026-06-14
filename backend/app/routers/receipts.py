"""
Receipts Router — receives asynchronous delivery callbacks from the channel stub.
This is the most critical endpoint for system correctness.

Design principles:
- IDEMPOTENT: same callback processed twice must have no side effects
- FORWARD-ONLY: message status never goes backward (delivered → failed is rejected)
- ATOMIC: stats increments happen in the same transaction as status update
"""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.message import Message
from app.models.event import CommEvent
from app.schemas.message import ReceiptPayload

router = APIRouter()
logger = logging.getLogger(__name__)

# Status progression — events outside this order are ignored
STATUS_ORDER = ["pending", "dispatched", "delivered", "opened", "clicked", "converted"]
FAILED_TERMINAL = "failed"

# Which campaign stat column to increment for each event type
STAT_COLUMN_MAP = {
    "delivered": "total_delivered",
    "failed": "total_failed",
    "opened": "total_opened",
    "clicked": "total_clicked",
    "converted": "total_converted",
}


@router.post("/receipts")
def receive_receipt(payload: ReceiptPayload, db: Session = Depends(get_db)):
    """
    Process a single delivery event callback from the channel stub.
    Returns 200 even for duplicates (so the stub doesn't retry forever).
    """
    # ── 1. Idempotency check ─────────────────────────────────────────────────
    existing = db.query(CommEvent).filter(
        CommEvent.idempotency_key == payload.idempotency_key
    ).first()
    if existing:
        logger.debug(f"Duplicate receipt ignored: {payload.idempotency_key}")
        return {"status": "already_processed"}

    # ── 2. Find message ──────────────────────────────────────────────────────
    message = db.query(Message).filter(
        Message.external_id == payload.external_id
    ).first()
    if not message:
        logger.warning(f"Receipt for unknown external_id: {payload.external_id}")
        raise HTTPException(status_code=404, detail="Message not found")

    # ── 3. Record event (always, even if we skip status update) ──────────────
    event = CommEvent(
        message_id=message.id,
        external_id=payload.external_id,
        event_type=payload.event_type,
        event_data=payload.event_data or {},
        idempotency_key=payload.idempotency_key,
        received_at=datetime.now(timezone.utc),
    )
    db.add(event)

    # ── 4. Advance message status (forward only) ─────────────────────────────
    event_type = payload.event_type
    status_updated = False

    if event_type == "failed":
        if message.status not in ("delivered", "opened", "clicked", "converted"):
            message.status = "failed"
            message.failed_reason = (payload.event_data or {}).get("reason", "unknown")
            status_updated = True

    elif event_type in STATUS_ORDER:
        current_idx = STATUS_ORDER.index(message.status) if message.status in STATUS_ORDER else 0
        new_idx = STATUS_ORDER.index(event_type)

        if new_idx > current_idx:
            message.status = event_type
            # Set the timestamp for this event
            ts = datetime.now(timezone.utc)
            if event_type == "dispatched":
                pass  # No specific column
            elif event_type == "delivered":
                message.delivered_at = ts
            elif event_type == "opened":
                message.opened_at = ts
            elif event_type == "clicked":
                message.clicked_at = ts
            elif event_type == "converted":
                message.converted_at = ts
            status_updated = True

    # ── 5. Increment campaign stat counter (atomic SQL) ──────────────────────
    if status_updated and event_type in STAT_COLUMN_MAP:
        col = STAT_COLUMN_MAP[event_type]
        db.execute(
            text(f"UPDATE campaigns SET {col} = {col} + 1 WHERE id = :cid"),
            {"cid": str(message.campaign_id)}
        )

        # Handle revenue attribution on conversion
        if event_type == "converted":
            order_amount = float((payload.event_data or {}).get("order_amount", 0))
            if order_amount > 0:
                db.execute(
                    text("UPDATE campaigns SET revenue_attributed = revenue_attributed + :amt WHERE id = :cid"),
                    {"amt": order_amount, "cid": str(message.campaign_id)}
                )

    db.commit()
    logger.debug(f"Receipt processed: {payload.external_id} → {event_type}")
    return {"status": "ok"}
