"""
PULSE CRM Backend — Main Application Entry Point
"""
import sys
import io
import logging

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import customers, segments, campaigns, aria, data, analytics, receipts

app = FastAPI(
    title="PULSE CRM API",
    description="AI-native Mini CRM for reaching shoppers — built for the Xeno FDE assignment",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(customers.router, prefix=f"{API_PREFIX}/customers", tags=["customers"])
app.include_router(segments.router, prefix=f"{API_PREFIX}/segments", tags=["segments"])
app.include_router(campaigns.router, prefix=f"{API_PREFIX}/campaigns", tags=["campaigns"])
app.include_router(aria.router, prefix=f"{API_PREFIX}/aria", tags=["aria"])
app.include_router(data.router, prefix=f"{API_PREFIX}/data", tags=["data"])
app.include_router(analytics.router, prefix=f"{API_PREFIX}/analytics", tags=["analytics"])
app.include_router(receipts.router, prefix=f"{API_PREFIX}", tags=["receipts"])


@app.get("/")
def root():
    return {
        "service": "PULSE CRM API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
