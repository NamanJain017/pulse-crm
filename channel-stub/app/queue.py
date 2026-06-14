"""
Queue — schedules and fires delivery callback events asynchronously.

Each incoming message is "planned" into a sequence of events with delays.
Events are scheduled as asyncio tasks that sleep until their fire time,
then POST a callback to the CRM.

This models exactly how real channel providers work: they accept your
send request immediately, then notify you of outcomes over time via webhook.
"""
import asyncio
import logging
from app.simulator import SimulationEngine
from app.callbacks import send_callback
from app.models import IncomingMessage, ReceiptCallback

logger = logging.getLogger(__name__)
engine = SimulationEngine()


async def _fire_event(message: IncomingMessage, event: dict):
    """Sleep until the scheduled time, then send the callback."""
    await asyncio.sleep(event["fire_after_seconds"])

    callback = ReceiptCallback(
        external_id=message.external_id,
        event_type=event["event_type"],
        idempotency_key=event["idempotency_key"],
        event_data=event["event_data"],
    )
    await send_callback(callback)


def enqueue_message(message: IncomingMessage):
    """
    Plan the event schedule for a message and fire all events as
    independent async tasks (non-blocking).
    """
    schedule = engine.build_callback_schedule(message)

    logger.info(
        f"Scheduled {len(schedule)} events for {message.external_id} "
        f"({message.channel}, tier={message.customer_tier}): "
        f"{[e['event_type'] for e in schedule]}"
    )

    for event in schedule:
        asyncio.create_task(_fire_event(message, event))


def enqueue_batch(messages: list[IncomingMessage]):
    """Enqueue a batch of messages. Each gets its own independent schedule."""
    for message in messages:
        enqueue_message(message)
