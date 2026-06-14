import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.segment import Segment
from app.schemas.segment import SegmentCreate, SegmentOut, SegmentPreview, NLSegmentRequest
from app.services import segment_service
from app.services.ai_service import parse_segment_brief

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", response_model=list[SegmentOut])
def list_segments(db: Session = Depends(get_db)):
    return db.query(Segment).order_by(Segment.created_at.desc()).all()


@router.post("", response_model=SegmentOut)
def create_segment(payload: SegmentCreate, db: Session = Depends(get_db)):
    """Create a segment from manually-specified rules."""
    count = segment_service.count_segment(payload.rules, db)

    segment = Segment(
        id=uuid.uuid4(),
        name=payload.name,
        description=payload.description,
        rules=payload.rules,
        nl_brief=payload.nl_brief,
        created_by="human",
        customer_count=count,
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)
    return segment


@router.post("/from-brief", response_model=SegmentOut)
def create_segment_from_brief(payload: NLSegmentRequest, db: Session = Depends(get_db)):
    """
    Create a segment from a natural-language brief using AI.
    If save=False, returns a preview without persisting.
    """
    try:
        parsed = parse_segment_brief(payload.brief)
    except Exception as e:
        logger.error(f"Segment brief parsing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Could not parse brief: {str(e)}")

    count = segment_service.count_segment(parsed["rules"], db)

    segment = Segment(
        id=uuid.uuid4(),
        name=payload.name or parsed.get("segment_name", "AI Segment"),
        description=parsed.get("rationale"),
        rules=parsed["rules"],
        nl_brief=payload.brief,
        ai_rationale=parsed.get("rationale"),
        created_by="aria",
        customer_count=count,
    )

    if payload.save:
        db.add(segment)
        db.commit()
        db.refresh(segment)
        return segment

    # Return unsaved preview (id is ephemeral)
    segment.id = uuid.uuid4()
    segment.created_at = None
    return SegmentOut(
        id=segment.id,
        name=segment.name,
        description=segment.description,
        rules=segment.rules,
        nl_brief=segment.nl_brief,
        ai_rationale=segment.ai_rationale,
        created_by=segment.created_by,
        customer_count=segment.customer_count,
        is_dynamic=True,
        created_at=__import__("datetime").datetime.now(__import__("datetime").timezone.utc),
    )


@router.get("/{segment_id}", response_model=SegmentOut)
def get_segment(segment_id: str, db: Session = Depends(get_db)):
    segment = db.query(Segment).filter(Segment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    return segment


@router.get("/{segment_id}/preview", response_model=SegmentPreview)
def preview_segment(segment_id: str, limit: int = 50, db: Session = Depends(get_db)):
    segment = db.query(Segment).filter(Segment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    customers = segment_service.preview_segment(segment.rules, db, limit=limit)
    total = segment_service.count_segment(segment.rules, db)

    return SegmentPreview(
        segment=segment,
        customers=customers,
        total_matched=total,
    )


@router.delete("/{segment_id}")
def delete_segment(segment_id: str, db: Session = Depends(get_db)):
    segment = db.query(Segment).filter(Segment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    db.delete(segment)
    db.commit()
    return {"status": "deleted"}
