"use client";

import { useRef } from "react";
import { MessageCircle, Send, CheckCircle2, Eye, MousePointerClick, ShoppingBag, XCircle, Radio, LucideIcon } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";
import { campaignsApi } from "@/lib/api";
import { CHANNEL_LABELS, STATUS_COLORS } from "@/lib/utils";

const EVENT_ICONS: Record<string, LucideIcon> = {
  dispatched: Send,
  delivered: CheckCircle2,
  opened: Eye,
  clicked: MousePointerClick,
  converted: ShoppingBag,
  failed: XCircle,
};

const EVENT_LABELS: Record<string, string> = {
  dispatched: "Dispatched",
  delivered: "Delivered",
  opened: "Opened",
  clicked: "Clicked",
  converted: "Converted",
  failed: "Failed",
};

// Glow colour per event type
const EVENT_GLOW: Record<string, string> = {
  dispatched: "rgba(59,130,246,0.15)",
  delivered:  "rgba(16,185,129,0.12)",
  opened:     "rgba(167,139,250,0.12)",
  clicked:    "rgba(124,58,237,0.14)",
  converted:  "rgba(245,158,11,0.16)",
  failed:     "rgba(244,63,94,0.1)",
};

export function DeliveryStream({ campaignId, isRunning }: { campaignId: string; isRunning: boolean }) {
  const { events, connected } = useSSE(isRunning ? campaignsApi.streamUrl(campaignId) : null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="card p-5"
      style={{
        background: "rgba(7, 9, 14, 0.7)",
        borderColor: isRunning && connected ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
        boxShadow: isRunning && connected ? "0 0 0 1px rgba(16,185,129,0.06), 0 0 24px -8px rgba(16,185,129,0.1)" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Live Delivery Stream
          </h3>
        </div>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#10B981" }}>
            <span className="live-dot" />
            {connected ? "Live" : "Connecting..."}
          </span>
        )}
      </div>

      {/* Content */}
      {!isRunning ? (
        <div className="py-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
          Stream is only active while the campaign is running.
        </div>
      ) : events.length === 0 ? (
        <div className="py-10 text-center text-sm flex flex-col items-center gap-2" style={{ color: "rgba(255,255,255,0.25)" }}>
          <MessageCircle size={20} className="animate-pulse" style={{ color: "rgba(16,185,129,0.4)" }} />
          Waiting for delivery events...
        </div>
      ) : (
        <div ref={containerRef} className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {events.map((evt, i) => {
            const Icon = EVENT_ICONS[evt.event_type] || MessageCircle;
            const color = STATUS_COLORS[evt.event_type] || "#8B949E";
            const glow = EVENT_GLOW[evt.event_type] || "transparent";
            const isNew = i >= events.length - 3; // animate newest 3

            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isNew ? "stream-entry" : ""}`}
                style={{
                  background: `rgba(255,255,255,0.025)`,
                  border: "1px solid rgba(255,255,255,0.04)",
                  animationDelay: isNew ? `${(events.length - 1 - i) * 0.06}s` : "0s",
                }}
              >
                {/* Event type icon */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: glow,
                    color,
                    border: `1px solid ${color}22`,
                  }}
                >
                  <Icon size={13} />
                </div>

                {/* Customer name */}
                <span className="font-medium flex-1 truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {evt.customer_name}
                </span>

                {/* Channel label */}
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {evt.channel ? CHANNEL_LABELS[evt.channel] : ""}
                </span>

                {/* Status badge */}
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    color,
                    background: `${color}15`,
                    border: `1px solid ${color}25`,
                  }}
                >
                  {EVENT_LABELS[evt.event_type] || evt.event_type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
