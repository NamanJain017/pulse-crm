"""
Callbacks — sends delivery event callbacks back to the CRM's /receipts endpoint.

Retry logic: exponential backoff, 3 attempts (1s, 2s, 4s).
If all retries fail, the event is dropped and logged (in a production system
this would go to a dead-letter queue for manual replay).

IMPORTANT: A global semaphore limits concurrent outbound HTTP connections to
MAX_CONCURRENT_CALLBACKS (default 50). Without this, firing 355 messages each
with multiple events simultaneously exhausts Windows select()'s 512 fd limit.
"""
import asyncio
import logging
import httpx
from app.config import settings
from app.models import ReceiptCallback

logger = logging.getLogger(__name__)

# Limit concurrent outbound HTTP connections to avoid Windows select() fd limit
_callback_semaphore = asyncio.Semaphore(50)


async def send_callback(callback: ReceiptCallback) -> bool:
    """
    POST a single receipt callback to the CRM, with retries.
    Returns True if successful, False if all retries exhausted.
    Acquires a semaphore slot before opening any HTTP connection.
    """
    delay = settings.RETRY_BASE_DELAY

    async with _callback_semaphore:
        async with httpx.AsyncClient(timeout=10.0) as client:
            for attempt in range(1, settings.MAX_RETRIES + 1):
                try:
                    response = await client.post(
                        settings.CRM_RECEIPT_URL,
                        json=callback.model_dump(),
                    )
                    if response.status_code == 200:
                        logger.debug(f"Callback delivered: {callback.external_id} -> {callback.event_type}")
                        return True
                    else:
                        logger.warning(
                            f"CRM returned {response.status_code} for {callback.external_id} "
                            f"({callback.event_type}), attempt {attempt}/{settings.MAX_RETRIES}"
                        )
                except httpx.RequestError as e:
                    logger.warning(
                        f"Could not reach CRM for {callback.external_id} "
                        f"({callback.event_type}), attempt {attempt}/{settings.MAX_RETRIES}: {e}"
                    )

                if attempt < settings.MAX_RETRIES:
                    await asyncio.sleep(delay)
                    delay *= 2  # exponential backoff

    logger.error(
        f"Callback permanently failed after {settings.MAX_RETRIES} attempts: "
        f"{callback.external_id} -> {callback.event_type}"
    )
    return False
