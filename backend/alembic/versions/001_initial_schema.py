"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-11

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable uuid generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    # ── customers ────────────────────────────────────────────────────────────
    op.create_table(
        "customers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(200), unique=True, nullable=True),
        sa.Column("phone", sa.String(20), unique=True, nullable=True),
        sa.Column("city", sa.String(100)),
        sa.Column("gender", sa.String(10)),
        sa.Column("age", sa.Integer),
        sa.Column("tier", sa.String(20), server_default="bronze"),
        sa.Column("preferred_cat", sa.String(100)),
        sa.Column("total_orders", sa.Integer, server_default="0"),
        sa.Column("total_spend", sa.Numeric(12, 2), server_default="0"),
        sa.Column("avg_order_value", sa.Numeric(10, 2), server_default="0"),
        sa.Column("last_order_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("days_since_last_order", sa.Integer, nullable=True),
        sa.Column("preferred_channel", sa.String(20), server_default="whatsapp"),
        sa.Column("opted_out", sa.Boolean, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_customers_tier", "customers", ["tier"])
    op.create_index("idx_customers_last_order", "customers", ["last_order_date"])
    op.create_index("idx_customers_total_spend", "customers", ["total_spend"])

    # ── segments ─────────────────────────────────────────────────────────────
    op.create_table(
        "segments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("rules", postgresql.JSONB, nullable=False),
        sa.Column("nl_brief", sa.Text),
        sa.Column("ai_rationale", sa.Text),
        sa.Column("created_by", sa.String(20), server_default="human"),
        sa.Column("customer_count", sa.Integer, server_default="0"),
        sa.Column("is_dynamic", sa.Boolean, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── campaigns ────────────────────────────────────────────────────────────
    op.create_table(
        "campaigns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("nl_brief", sa.Text),
        sa.Column("segment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("segments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("channel", sa.String(20), nullable=False),
        sa.Column("message_template", sa.Text),
        sa.Column("personalization_mode", sa.String(20), server_default="per_customer"),
        sa.Column("ai_generated", sa.Boolean, server_default=sa.text("false")),
        sa.Column("status", sa.String(20), server_default="draft"),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("launched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_recipients", sa.Integer, server_default="0"),
        sa.Column("total_sent", sa.Integer, server_default="0"),
        sa.Column("total_delivered", sa.Integer, server_default="0"),
        sa.Column("total_failed", sa.Integer, server_default="0"),
        sa.Column("total_opened", sa.Integer, server_default="0"),
        sa.Column("total_clicked", sa.Integer, server_default="0"),
        sa.Column("total_converted", sa.Integer, server_default="0"),
        sa.Column("revenue_attributed", sa.Numeric(12, 2), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── orders ───────────────────────────────────────────────────────────────
    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("order_number", sa.String(50), unique=True, nullable=False),
        sa.Column("status", sa.String(20), server_default="completed"),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("channel", sa.String(20)),
        sa.Column("attributed_to", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_orders_customer", "orders", ["customer_id"])
    op.create_index("idx_orders_created", "orders", ["created_at"])

    # ── order_items ──────────────────────────────────────────────────────────
    op.create_table(
        "order_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product", sa.String(200), nullable=False),
        sa.Column("category", sa.String(100)),
        sa.Column("quantity", sa.Integer, server_default="1"),
        sa.Column("unit_price", sa.Numeric(10, 2)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── messages ─────────────────────────────────────────────────────────────
    op.create_table(
        "messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("channel", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("external_id", sa.String(200), unique=True, nullable=True),
        sa.Column("failed_reason", sa.String(200), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("clicked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("converted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_messages_campaign", "messages", ["campaign_id"])
    op.create_index("idx_messages_customer", "messages", ["customer_id"])
    op.create_index("idx_messages_status", "messages", ["status"])
    op.create_index("idx_messages_external", "messages", ["external_id"])

    # ── comm_events ──────────────────────────────────────────────────────────
    op.create_table(
        "comm_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("message_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("messages.id", ondelete="CASCADE"), nullable=False),
        sa.Column("external_id", sa.String(200)),
        sa.Column("event_type", sa.String(30), nullable=False),
        sa.Column("event_data", postgresql.JSONB),
        sa.Column("idempotency_key", sa.String(200), unique=True, nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_events_message", "comm_events", ["message_id"])
    op.create_index("idx_events_type", "comm_events", ["event_type"])


def downgrade() -> None:
    op.drop_table("comm_events")
    op.drop_table("messages")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("campaigns")
    op.drop_table("segments")
    op.drop_table("customers")
