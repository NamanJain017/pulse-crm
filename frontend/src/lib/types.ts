// ─────────────────────────────────────────────────────────────────────────
// Shared types — mirrors backend Pydantic schemas
// ─────────────────────────────────────────────────────────────────────────

export type Tier = "bronze" | "silver" | "gold" | "platinum";
export type Channel = "whatsapp" | "sms" | "email" | "rcs" | "mixed";
export type CampaignStatus = "draft" | "running" | "completed" | "failed";
export type MessageStatus =
  | "pending"
  | "dispatched"
  | "delivered"
  | "failed"
  | "opened"
  | "clicked"
  | "converted";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  gender: string | null;
  age: number | null;
  tier: Tier;
  preferred_cat: string | null;
  total_orders: number;
  total_spend: number;
  avg_order_value: number;
  last_order_date: string | null;
  days_since_last_order: number | null;
  preferred_channel: Channel;
  opted_out: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product: string;
  category: string | null;
  quantity: number;
  unit_price: number | null;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  channel: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface CustomerDetail extends Customer {
  orders: Order[];
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ─── Segments ───────────────────────────────────────────────────────────

export interface SegmentCondition {
  field: string;
  op: string;
  value: string | number | boolean | string[];
}

export interface SegmentRuleTree {
  operator: "AND" | "OR";
  conditions: (SegmentCondition | SegmentRuleTree)[];
}

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  rules: SegmentRuleTree;
  nl_brief: string | null;
  ai_rationale: string | null;
  created_by: "human" | "aria";
  customer_count: number;
  is_dynamic: boolean;
  created_at: string;
}

export interface SegmentPreviewCustomer {
  id: string;
  name: string;
  city: string;
  tier: Tier;
  total_spend: number;
  days_since_last_order: number | null;
  preferred_cat: string;
  preferred_channel: Channel;
}

export interface SegmentPreview {
  segment: Segment;
  customers: SegmentPreviewCustomer[];
  total_matched: number;
}

// ─── Campaigns ──────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  nl_brief: string | null;
  segment_id: string | null;
  channel: Channel;
  personalization_mode: "per_customer" | "template";
  ai_generated: boolean;
  status: CampaignStatus;
  scheduled_at: string | null;
  launched_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  revenue_attributed: number;
  created_at: string;
}

export interface CampaignAnalytics {
  campaign: Campaign;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  revenue_per_message: number;
  channel_breakdown: Record<string, Record<string, number>>;
  ai_insight: string | null;
}

export interface MessageItem {
  id: string;
  campaign_id: string;
  customer_id: string;
  customer_name?: string;
  channel: Channel;
  content: string;
  status: MessageStatus;
  external_id: string | null;
  failed_reason: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  converted_at: string | null;
  created_at: string;
}

// ─── ARIA ───────────────────────────────────────────────────────────────

export interface ARIASampleMessage {
  customer_name: string;
  message: string;
}

export interface ARIAPlan {
  plan_id: string;
  segment_name: string;
  segment_rules: SegmentRuleTree;
  segment_rationale: string;
  customer_count: number;
  channel: Channel;
  channel_rationale: string;
  timing_suggestion: string;
  sample_messages: ARIASampleMessage[];
  estimated_open_rate: number;
  estimated_revenue_low: number;
  estimated_revenue_high: number;
}

export interface ARIAApproveResponse {
  status: string;
  campaign_id: string;
  segment_id: string;
  total_recipients: number;
}

// ─── Analytics ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total_customers: number;
  total_campaigns: number;
  messages_sent_30d: number;
  revenue_attributed_30d: number;
  avg_delivery_rate: number;
  avg_open_rate: number;
  top_channel: string;
  active_campaigns: number;
}

export interface ChannelStats {
  channel: string;
  total_sent: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
}

export interface DailyReach {
  date: string;
  messages_sent: number;
  delivered: number;
  opened: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  daily_reach: DailyReach[];
  channel_stats: ChannelStats[];
  recent_campaigns: Array<{
    id: string;
    name: string;
    channel: string;
    status: string;
    total_recipients: number;
    total_delivered: number;
    total_opened: number;
    created_at: string;
  }>;
  ai_insight: string;
}

// ─── SSE Stream ─────────────────────────────────────────────────────────

export interface DeliveryStreamEvent {
  event_type: string;
  customer_name?: string;
  channel?: string;
  received_at?: string;
}
