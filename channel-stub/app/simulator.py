"""
Simulation Engine — models the realistic lifecycle of message delivery
across WhatsApp, SMS, Email, and RCS channels.

Design notes:
- Each channel has different delivery/open/click rates based on real-world benchmarks.
- Customer tier (platinum/gold/silver/bronze) multiplies engagement probabilities —
  higher-tier customers engage more (this is realistic: loyal customers open more).
- Event timing follows realistic delays (a WhatsApp message delivers in seconds,
  an email might take longer and get opened hours later).
- TIME_COMPRESSION_FACTOR scales all delays down for demo purposes — a 30 minute
  real-world delay becomes 30 seconds when the factor is 60.
"""
import random
import uuid
from typing import List, Dict, Optional
from app.config import settings

# ─────────────────────────────────────────────────────────────────────────────
# CHANNEL CONFIGURATION
# Rates are based on realistic industry benchmarks for Indian D2C messaging.
# ─────────────────────────────────────────────────────────────────────────────

CHANNEL_CONFIG = {
    "whatsapp": {
        "delivery_rate": 0.95,
        "open_rate": 0.52,          # conditional on delivered
        "click_rate": 0.18,         # conditional on opened
        "delivery_delay": (1, 15),       # seconds (real-world)
        "open_delay": (120, 1800),       # 2-30 minutes after delivery
        "click_delay": (30, 600),        # 30s-10min after open
        "failure_types": {
            "invalid_number": 0.03,
            "unsubscribed": 0.015,
            "network_error": 0.005,
        },
    },
    "sms": {
        "delivery_rate": 0.90,
        "open_rate": 0.28,
        "click_rate": 0.08,
        "delivery_delay": (2, 30),
        "open_delay": (300, 3600),       # 5-60 minutes
        "click_delay": (60, 1800),
        "failure_types": {
            "invalid_number": 0.05,
            "dnd_registered": 0.04,
            "network_error": 0.01,
        },
    },
    "email": {
        "delivery_rate": 0.83,
        "open_rate": 0.21,
        "click_rate": 0.05,
        "delivery_delay": (5, 120),
        "open_delay": (1800, 28800),     # 30min - 8 hours
        "click_delay": (120, 3600),
        "failure_types": {
            "bounced": 0.08,
            "spam_filtered": 0.07,
            "invalid_email": 0.02,
        },
    },
    "rcs": {
        "delivery_rate": 0.88,
        "open_rate": 0.44,
        "click_rate": 0.22,
        "delivery_delay": (2, 20),
        "open_delay": (180, 2700),       # 3-45 minutes
        "click_delay": (30, 900),
        "failure_types": {
            "rcs_not_supported": 0.08,
            "network_error": 0.04,
        },
    },
}

# Tier-based engagement multipliers — loyal customers engage more
TIER_MULTIPLIERS = {
    "platinum": {"open": 1.35, "click": 1.5, "delivery": 1.02},
    "gold":     {"open": 1.15, "click": 1.25, "delivery": 1.01},
    "silver":   {"open": 1.0,  "click": 1.0,  "delivery": 1.0},
    "bronze":   {"open": 0.85, "click": 0.75, "delivery": 0.98},
}

# Probability that a "clicked" message results in a conversion (order)
CONVERSION_RATE_GIVEN_CLICK = 0.15

# Simulated order amount range for conversions (rupees)
CONVERSION_ORDER_RANGE = (800, 6500)


def _compress(seconds_range: tuple) -> float:
    """Apply time compression and return a random delay in seconds."""
    low, high = seconds_range
    raw = random.uniform(low, high)
    return max(0.5, raw / settings.TIME_COMPRESSION_FACTOR)


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


class SimulationEngine:
    """
    Computes the full event timeline for a single message based on
    its channel and the recipient's tier.
    """

    def plan_events(self, message) -> List[Dict]:
        """
        Given an IncomingMessage, returns an ordered list of scheduled events.
        Each event dict: { "event_type": str, "delay_seconds": float, "event_data": dict }

        The first event is always "dispatched" (delay ~0).
        Then either "failed" (terminal) OR "delivered" → possibly "opened" → possibly "clicked" → possibly "converted"
        """
        channel = message.channel if message.channel in CHANNEL_CONFIG else "whatsapp"
        config = CHANNEL_CONFIG[channel]
        tier_mult = TIER_MULTIPLIERS.get(message.customer_tier, TIER_MULTIPLIERS["silver"])

        events = []

        # 1. Dispatched — always happens almost immediately
        events.append({
            "event_type": "dispatched",
            "delay_seconds": _compress((0.5, 2)),
            "event_data": {},
        })

        # 2. Delivery vs Failure
        delivery_rate = _clamp(config["delivery_rate"] * tier_mult["delivery"])
        delivered = random.random() < delivery_rate

        if not delivered:
            # Pick a failure reason weighted by configured probabilities
            failure_types = config["failure_types"]
            reasons = list(failure_types.keys())
            weights = list(failure_types.values())
            # Normalize weights (they sum to less than 1 - delivery_rate typically)
            total = sum(weights)
            normalized = [w / total for w in weights] if total > 0 else None
            reason = random.choices(reasons, weights=normalized)[0] if normalized else reasons[0]

            events.append({
                "event_type": "failed",
                "delay_seconds": _compress(config["delivery_delay"]),
                "event_data": {"reason": reason},
            })
            return events  # Terminal — no further events

        # Delivered
        events.append({
            "event_type": "delivered",
            "delay_seconds": _compress(config["delivery_delay"]),
            "event_data": {},
        })

        # 3. Opened?
        open_rate = _clamp(config["open_rate"] * tier_mult["open"])
        if random.random() < open_rate:
            events.append({
                "event_type": "opened",
                "delay_seconds": _compress(config["open_delay"]),
                "event_data": {},
            })

            # 4. Clicked?
            click_rate = _clamp(config["click_rate"] * tier_mult["click"])
            if random.random() < click_rate:
                events.append({
                    "event_type": "clicked",
                    "delay_seconds": _compress(config["click_delay"]),
                    "event_data": {},
                })

                # 5. Converted?
                if random.random() < CONVERSION_RATE_GIVEN_CLICK:
                    order_amount = round(random.uniform(*CONVERSION_ORDER_RANGE), 2)
                    events.append({
                        "event_type": "converted",
                        "delay_seconds": _compress((60, 600)),  # 1-10 min after click
                        "event_data": {"order_amount": order_amount},
                    })

        return events

    def build_callback_schedule(self, message) -> List[Dict]:
        """
        Convert relative event delays into a flat schedule with cumulative
        delay (so events fire in correct chronological order).

        Returns list of: { event_type, fire_after_seconds, idempotency_key, event_data }
        """
        events = self.plan_events(message)
        schedule = []
        cumulative = 0.0

        for evt in events:
            cumulative += evt["delay_seconds"]
            idempotency_key = f"{message.external_id}:{evt['event_type']}:{uuid.uuid4().hex[:8]}"
            schedule.append({
                "event_type": evt["event_type"],
                "fire_after_seconds": cumulative,
                "idempotency_key": idempotency_key,
                "event_data": evt["event_data"],
            })

        return schedule
