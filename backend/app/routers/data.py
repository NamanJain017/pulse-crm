import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.campaign import Campaign
from app.core.seed import run_seed

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/seed")
def seed_database(db: Session = Depends(get_db)):
    """
    Seed the database with realistic KORA brand synthetic data.
    WARNING: This clears all existing data first. Idempotent — safe to re-run.
    """
    try:
        result = run_seed(db)
        return {"status": "seeded", **result}
    except Exception as e:
        logger.error(f"Seed failed: {e}")
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")


@router.get("/stats")
def get_data_stats(db: Session = Depends(get_db)):
    """Quick stats for verifying the database state."""
    return {
        "customers": db.query(func.count(Customer.id)).scalar() or 0,
        "orders": db.query(func.count(Order.id)).scalar() or 0,
        "campaigns": db.query(func.count(Campaign.id)).scalar() or 0,
        "total_revenue": float(db.query(func.sum(Order.total_amount)).scalar() or 0),
        "tier_breakdown": {
            row.tier: row.cnt for row in
            db.query(Customer.tier, func.count(Customer.id).label("cnt")).group_by(Customer.tier).all()
        },
    }
