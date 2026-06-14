import { Campaign } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

export function FunnelChart({ campaign }: { campaign: Campaign }) {
  const stages: FunnelStage[] = [
    { label: "Sent",      value: campaign.total_sent,      color: "#3B82F6" },
    { label: "Delivered", value: campaign.total_delivered, color: "#10B981" },
    { label: "Opened",    value: campaign.total_opened,    color: "#A78BFA" },
    { label: "Clicked",   value: campaign.total_clicked,   color: "#7C3AED" },
    { label: "Converted", value: campaign.total_converted, color: "#F59E0B" },
  ];

  const max = Math.max(stages[0].value, 1);

  return (
    <div className="space-y-4 py-1">
      {stages.map((stage, i) => {
        const pct = stage.value / max;
        const prevValue = i > 0 ? stages[i - 1].value : stage.value;
        const conversionFromPrev = prevValue > 0 ? stage.value / prevValue : 0;
        const widthPct = Math.max(pct * 100, stage.value > 0 ? 2 : 0);

        return (
          <div key={stage.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                {stage.label}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {formatNumber(stage.value)}
                </span>
                {i > 0 && (
                  <span
                    className="text-xs font-mono w-12 text-right tabular-nums"
                    style={{ color: conversionFromPrev > 0.5 ? stage.color : "rgba(255,255,255,0.25)" }}
                  >
                    {formatPercent(conversionFromPrev)}
                  </span>
                )}
              </div>
            </div>

            {/* Track */}
            <div
              className="h-2 rounded-full overflow-hidden relative"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {/* Fill bar with glow tip */}
              <div
                className="h-full rounded-full funnel-bar"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${stage.color}88, ${stage.color})`,
                  boxShadow: widthPct > 2 ? `0 0 8px 0 ${stage.color}55` : "none",
                  transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>
        );
      })}

      {campaign.total_failed > 0 && (
        <div
          className="pt-3 flex items-center justify-between text-sm"
          style={{ borderTop: "1px solid rgba(244,63,94,0.15)" }}
        >
          <span style={{ color: "rgba(244,63,94,0.8)" }}>Failed</span>
          <span className="font-mono font-semibold" style={{ color: "#F43F5E" }}>
            {formatNumber(campaign.total_failed)}
          </span>
        </div>
      )}
    </div>
  );
}
