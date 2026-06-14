"""
Segment Service — translates stored JSON rule trees into SQLAlchemy filter queries.
"""
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.customer import Customer

logger = logging.getLogger(__name__)

# Maps rule field names → Customer ORM columns
FIELD_MAP = {
    "days_since_last_order": Customer.days_since_last_order,
    "total_spend": Customer.total_spend,
    "avg_order_value": Customer.avg_order_value,
    "total_orders": Customer.total_orders,
    "tier": Customer.tier,
    "preferred_cat": Customer.preferred_cat,
    "city": Customer.city,
    "gender": Customer.gender,
    "age": Customer.age,
    "opted_out": Customer.opted_out,
}

# Maps operator strings → SQLAlchemy comparison lambdas
OP_MAP = {
    "gte": lambda f, v: f >= v,
    "lte": lambda f, v: f <= v,
    "gt":  lambda f, v: f > v,
    "lt":  lambda f, v: f < v,
    "eq":  lambda f, v: f == v,
    "neq": lambda f, v: f != v,
    "in":  lambda f, v: f.in_(v),
}


def _build_filter(node: Dict[str, Any]):
    """
    Recursively converts a rule tree node into a SQLAlchemy filter expression.

    Node types:
    1. Leaf condition: { "field": "...", "op": "...", "value": ... }
    2. Composite:      { "operator": "AND"|"OR", "conditions": [...] }
    """
    if "conditions" in node:
        sub_filters = [_build_filter(c) for c in node["conditions"]]
        if not sub_filters:
            return True  # Empty condition tree matches everything

        if node.get("operator", "AND").upper() == "OR":
            return or_(*sub_filters)
        return and_(*sub_filters)

    else:
        field_name = node.get("field")
        op_name = node.get("op")
        value = node.get("value")

        if field_name not in FIELD_MAP:
            logger.warning(f"Unknown segment field: {field_name}, skipping")
            return True   # Unknown field — don't filter on it

        if op_name not in OP_MAP:
            logger.warning(f"Unknown operator: {op_name}, skipping")
            return True

        field = FIELD_MAP[field_name]
        op_fn = OP_MAP[op_name]

        # Handle null safety for numeric fields
        if op_name in ("gte", "lte", "gt", "lt") and field_name in (
            "days_since_last_order", "total_spend", "avg_order_value", "total_orders", "age"
        ):
            return and_(field.isnot(None), op_fn(field, value))

        return op_fn(field, value)


def execute_segment(rules: Dict[str, Any], db: Session) -> List[Customer]:
    """
    Execute a segment rule tree and return matching Customer objects.
    """
    try:
        filter_expr = _build_filter(rules)
        return db.query(Customer).filter(filter_expr).all()
    except Exception as e:
        logger.error(f"Segment execution failed: {e}")
        raise ValueError(f"Invalid segment rules: {e}")


def count_segment(rules: Dict[str, Any], db: Session) -> int:
    """Count matching customers without loading all records."""
    try:
        filter_expr = _build_filter(rules)
        return db.query(Customer).filter(filter_expr).count()
    except Exception as e:
        logger.error(f"Segment count failed: {e}")
        return 0


def preview_segment(rules: Dict[str, Any], db: Session, limit: int = 20) -> List[Dict]:
    """
    Return trimmed customer data for segment preview in the UI.
    """
    try:
        filter_expr = _build_filter(rules)
        customers = db.query(Customer).filter(filter_expr).limit(limit).all()
        return [
            {
                "id": str(c.id),
                "name": c.name,
                "city": c.city,
                "tier": c.tier,
                "total_spend": float(c.total_spend or 0),
                "days_since_last_order": c.days_since_last_order,
                "preferred_cat": c.preferred_cat,
                "preferred_channel": c.preferred_channel,
            }
            for c in customers
        ]
    except Exception as e:
        logger.error(f"Segment preview failed: {e}")
        return []
