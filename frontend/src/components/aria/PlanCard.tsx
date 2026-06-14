"use client";

import { Users, Radio, Clock, TrendingUp, MessageSquare, LucideIcon, Sparkles } from "lucide-react";
import { ARIAPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, formatPercent, CHANNEL_LABELS } from "@/lib/utils";

interface PlanCardProps {
  plan: ARIAPlan;
  onApprove: () => void;
  onDiscard: () => void;
  isApproving: boolean;
}

export function PlanCard({ plan, onApprove, onDiscard, isApproving }: PlanCardProps) {
  return (
    <div
      className="card ai-shimmer p-6 animate-slide-up"
      style={{
        background: "rgba(10, 11, 18, 0.8)",
        borderColor: "rgba(124,58,237,0.3)",
        boxShadow: "0 0 0 1px rgba(124,58,237,0.1), 0 8px 48px -12px rgba(124,58,237,0.25)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.15) 100%)",
            boxShadow: "0 0 10px rgba(124,58,237,0.3)",
          }}
        >
          <Sparkles size={13} style={{ color: "#C4B5FD" }} />
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-[0.15em]"
          style={{ color: "rgba(196,181,253,0.8)" }}
        >
          ARIA's Campaign Plan
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.15)" }} />
      </div>

      {/* Audience */}
      <PlanSection icon={Users} title={`Audience: ${plan.segment_name}`} accent="#3B82F6">
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className="text-3xl font-bold font-mono"
            style={{
              color: "#E6EDF3",
              textShadow: "0 0 20px rgba(59,130,246,0.3)",
            }}
          >
            {formatNumber(plan.customer_count)}
          </span>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>customers identified</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          {plan.segment_rationale}
        </p>
      </PlanSection>

      {/* Channel */}
      <PlanSection icon={Radio} title="Channel" accent="#3B82F6">
        <div className="flex items-center gap-2.5 mb-2">
          <Badge color="#3B82F6">{CHANNEL_LABELS[plan.channel] || plan.channel}</Badge>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Est. {formatPercent(plan.estimated_open_rate)} open rate
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          {plan.channel_rationale}
        </p>
      </PlanSection>

      {/* Timing */}
      <PlanSection icon={Clock} title="Recommended Timing" accent="#F59E0B">
        <p className="text-sm font-medium text-white">{plan.timing_suggestion}</p>
      </PlanSection>

      {/* Sample messages */}
      {plan.sample_messages.length > 0 && (
        <PlanSection icon={MessageSquare} title="Sample Personalized Messages" accent="#A78BFA">
          <div className="space-y-2.5">
            {plan.sample_messages.map((msg, i) => (
              <div
                key={i}
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                  style={{ color: "rgba(167,139,250,0.8)" }}
                >
                  <span className="opacity-60">→</span> {msg.customer_name}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {msg.message}
                </div>
              </div>
            ))}
            {plan.customer_count > plan.sample_messages.length && (
              <div className="text-xs text-center pt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                +{formatNumber(plan.customer_count - plan.sample_messages.length)} more personalized messages will be generated on launch
              </div>
            )}
          </div>
        </PlanSection>
      )}

      {/* Revenue estimate — hero block */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.03) 100%)",
          border: "1px solid rgba(16,185,129,0.2)",
          boxShadow: "0 0 24px -8px rgba(16,185,129,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} style={{ color: "#10B981" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(16,185,129,0.8)" }}>
            Estimated Impact
          </span>
        </div>
        <div
          className="text-2xl font-bold font-mono"
          style={{
            color: "#10B981",
            textShadow: "0 0 20px rgba(16,185,129,0.35)",
          }}
        >
          {formatCurrency(plan.estimated_revenue_low)} – {formatCurrency(plan.estimated_revenue_high)}
        </div>
        <div className="text-xs mt-1" style={{ color: "rgba(16,185,129,0.5)" }}>
          Estimated attributable revenue
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-3 pt-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Button
          variant="ai"
          size="lg"
          onClick={onApprove}
          disabled={isApproving}
          className="flex-1 btn-ai-pulse"
          style={{
            boxShadow: isApproving ? "none" : "0 0 24px -4px rgba(124,58,237,0.5)",
          }}
        >
          {isApproving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Launching campaign...
            </>
          ) : (
            "Approve & Launch"
          )}
        </Button>
        <Button variant="ghost" size="lg" onClick={onDiscard} disabled={isApproving}
          style={{ color: "rgba(255,255,255,0.35)" }}>
          Discard
        </Button>
      </div>
    </div>
  );
}

function PlanSection({
  icon: Icon,
  title,
  accent = "#A78BFA",
  children,
}: {
  icon: LucideIcon;
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={13} style={{ color: accent }} />
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <div className="pl-5">{children}</div>
    </div>
  );
}
