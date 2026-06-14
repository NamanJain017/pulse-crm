import { Sparkles } from "lucide-react";

export function AIInsightCard({ insight }: { insight: string }) {
  return (
    <div
      className="card ai-shimmer p-5"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.03) 60%, rgba(16,185,129,0.04) 100%)",
        borderColor: "rgba(124,58,237,0.25)",
        boxShadow: "0 0 0 1px rgba(124,58,237,0.08), 0 4px 32px -8px rgba(124,58,237,0.15)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Pulsing icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.15) 100%)",
            boxShadow: "0 0 12px rgba(124,58,237,0.3)",
          }}
        >
          <Sparkles size={16} style={{ color: "#C4B5FD" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5"
            style={{ color: "rgba(196,181,253,0.7)" }}
          >
            AI Insight
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
