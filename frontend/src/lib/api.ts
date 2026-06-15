import {
  Customer,
  CustomerDetail,
  CustomerListResponse,
  Segment,
  SegmentPreview,
  Campaign,
  CampaignAnalytics,
  MessageItem,
  ARIAPlan,
  ARIAApproveResponse,
  DashboardResponse,
  SegmentRuleTree,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE = `${API_URL}/api/v1`;

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }

  return res.json();
}

// ─── Customers ──────────────────────────────────────────────────────────

export const customersApi = {
  list: (params: {
    search?: string;
    tier?: string;
    city?: string;
    sort_by?: string;
    sort_dir?: string;
    page?: number;
    page_size?: number;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return request<CustomerListResponse>(`/customers?${qs.toString()}`);
  },

  get: (id: string) => request<CustomerDetail>(`/customers/${id}`),

  exportUrl: () => `${BASE}/customers/export`,
};

// ─── Segments ───────────────────────────────────────────────────────────

export const segmentsApi = {
  list: () => request<Segment[]>("/segments"),

  get: (id: string) => request<Segment>(`/segments/${id}`),

  create: (payload: { name: string; description?: string; rules: SegmentRuleTree; nl_brief?: string }) =>
    request<Segment>("/segments", { method: "POST", body: JSON.stringify(payload) }),

  createFromBrief: (payload: { brief: string; save?: boolean; name?: string }) =>
    request<Segment>("/segments/from-brief", { method: "POST", body: JSON.stringify(payload) }),

  preview: (id: string, limit = 50) =>
    request<SegmentPreview>(`/segments/${id}/preview?limit=${limit}`),

  delete: (id: string) => request<{ status: string }>(`/segments/${id}`, { method: "DELETE" }),
};

// ─── Campaigns ──────────────────────────────────────────────────────────

export const campaignsApi = {
  list: (status?: string) =>
    request<Campaign[]>(`/campaigns${status ? `?status=${status}` : ""}`),

  get: (id: string) => request<Campaign>(`/campaigns/${id}`),

  create: (payload: {
    name: string;
    description?: string;
    segment_id: string;
    channel: string;
    message_template?: string;
    personalization_mode?: string;
    nl_brief?: string;
  }) => request<Campaign>("/campaigns", { method: "POST", body: JSON.stringify(payload) }),

  launch: (id: string) => request<Campaign>(`/campaigns/${id}/launch`, { method: "POST" }),

  delete: (id: string) => request<{ status: string }>(`/campaigns/${id}`, { method: "DELETE" }),

  analytics: (id: string) => request<CampaignAnalytics>(`/campaigns/${id}/analytics`),

  messages: (id: string, page = 1, pageSize = 50) =>
    request<MessageItem[]>(`/campaigns/${id}/messages?page=${page}&page_size=${pageSize}`),

  streamUrl: (id: string) => `${BASE}/campaigns/stream/${id}`,
};

// ─── ARIA ───────────────────────────────────────────────────────────────

export const ariaApi = {
  brief: (brief: string) =>
    request<ARIAPlan>("/aria/brief", { method: "POST", body: JSON.stringify({ brief }) }),

  approve: (planId: string) =>
    request<ARIAApproveResponse>(`/aria/approve/${planId}`, { method: "POST" }),

  insights: () => request<{ insight: string }>("/aria/insights"),
};

// ─── Analytics ──────────────────────────────────────────────────────────

export const analyticsApi = {
  dashboard: () => request<DashboardResponse>("/analytics/dashboard"),
};

// ─── Data / Seed ────────────────────────────────────────────────────────

export const dataApi = {
  seed: () => request<{ status: string; customers: number; orders: number; order_items: number }>(
    "/data/seed",
    { method: "POST" }
  ),
  stats: () => request<{
    customers: number;
    orders: number;
    campaigns: number;
    total_revenue: number;
    tier_breakdown: Record<string, number>;
  }>("/data/stats"),
};

export { ApiError };
