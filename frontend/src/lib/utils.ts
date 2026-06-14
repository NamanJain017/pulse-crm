import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export const TIER_COLORS: Record<string, string> = {
  bronze: "#92400E",
  silver: "#6B7280",
  gold: "#D97706",
  platinum: "#7C3AED",
};

export const TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  rcs: "RCS",
  mixed: "Mixed",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "#8B949E",
  running: "#3B82F6",
  completed: "#10B981",
  failed: "#F43F5E",
  pending: "#8B949E",
  dispatched: "#3B82F6",
  delivered: "#10B981",
  opened: "#A78BFA",
  clicked: "#7C3AED",
  converted: "#F59E0B",
};
