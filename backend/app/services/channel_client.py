"""
Channel Client — sends campaign messages to the channel stub service.
"""
import logging
import httpx
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


async def dispatch_to_channel(messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Send a batch of messages to the channel stub.

    Each message dict must include:
      external_id, customer_id, channel, content,
      customer_tier, customer_preferred_channel
    """
    url = f"{settings.CHANNEL_STUB_URL}/send"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json={"messages": messages})
            response.raise_for_status()
            result = response.json()
            logger.info(f"Dispatched {len(messages)} messages to channel stub: {result}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"Channel stub returned error {e.response.status_code}: {e.response.text}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Could not reach channel stub at {url}: {e}")
            raise
