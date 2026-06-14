from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID


class SegmentRule(BaseModel):
    """A single filter condition."""
    field: str        # e.g. days_since_last_order
    op: str           # gte / lte / eq / neq / in / gt / lt
    value: Any        # 45, "Ethnic Wear", ["gold", "platinum"]


class SegmentRuleTree(BaseModel):
    """Supports AND/OR nesting of conditions."""
    operator: str = "AND"    # AND / OR
    conditions: List[Any]    # SegmentRule or nested SegmentRuleTree


class SegmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    rules: Dict[str, Any]               # Raw JSONB rule tree
    nl_brief: Optional[str] = None      # Original natural-language brief


class SegmentOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    rules: Dict[str, Any]
    nl_brief: Optional[str] = None
    ai_rationale: Optional[str] = None
    created_by: str
    customer_count: int
    is_dynamic: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SegmentPreview(BaseModel):
    segment: SegmentOut
    customers: List[Dict[str, Any]]    # Trimmed customer data for preview
    total_matched: int


class NLSegmentRequest(BaseModel):
    """Used by ARIA to parse a natural-language brief into a segment."""
    brief: str
    save: bool = False                 # Whether to persist the segment
    name: Optional[str] = None
