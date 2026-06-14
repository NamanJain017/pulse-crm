"""
PULSE Channel Stub Service

This is a STANDALONE service that simulates message delivery across
WhatsApp, SMS, Email, and RCS channels. It does NOT integrate with any
real messaging provider.

Flow:
1. CRM calls POST /send with a batch of messages
2. This service immediately accepts the batch (202-style response)
3. For each message, a realistic event timeline is computed (delivered/failed,
   opened, clicked, converted) with probabilistic outcomes and tier-based weighting
4. Events fire asynchronously over time, each POSTing a callback to the
   CRM's /api/v1/receipts endpoint

This models how real providers (Twilio, MSG91, etc.) work — accept now,
notify later via webhook.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import SendRequest, SendResponse
from app.queue import enqueue_batch

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PULSE Channel Stub",
    description="Simulated messaging channel service (WhatsApp/SMS/Email/RCS)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"service": "PULSE Channel Stub", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/send", response_model=SendResponse)
async def send_messages(payload: SendRequest):
    """
    Accept a batch of messages for simulated delivery.
    Returns immediately; callbacks fire asynchronously.
    """
    valid_channels = {"whatsapp", "sms", "email", "rcs"}
    accepted = []
    rejected = 0

    for msg in payload.messages:
        if msg.channel not in valid_channels:
            logger.warning(f"Rejected message {msg.external_id}: unknown channel '{msg.channel}'")
            rejected += 1
            continue
        accepted.append(msg)

    logger.info(f"Received batch: {len(accepted)} accepted, {rejected} rejected")

    # Schedule async delivery simulation — does not block the response
    enqueue_batch(accepted)

    return SendResponse(accepted=len(accepted), rejected=rejected)
