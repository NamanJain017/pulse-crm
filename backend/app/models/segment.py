import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base

# JSONB on Postgres, plain JSON on SQLite (for local dev/testing)
JSONType = JSONB().with_variant(JSON(), "sqlite")


class Segment(Base):
    """
    A reusable audience definition.

    rules: JSONB filter tree, e.g.
    {
      "operator": "AND",
      "conditions": [
        { "field": "days_since_last_order", "op": "gte", "value": 45 },
        { "field": "total_spend", "op": "gte", "value": 5000 }
      ]
    }
    """
    __tablename__ = "segments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    rules = Column(JSONType, nullable=False)

    # AI-related metadata
    nl_brief = Column(Text)            # Original plain-English input
    ai_rationale = Column(Text)        # Why ARIA chose these rules
    created_by = Column(String(20), default="human")  # human / aria

    # Stats — refreshed on preview/launch
    customer_count = Column(Integer, default=0)
    is_dynamic = Column(Boolean, default=True)   # Recomputed on each launch

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    campaigns = relationship("Campaign", back_populates="segment")

    def __repr__(self):
        return f"<Segment '{self.name}' [{self.customer_count} customers]>"
