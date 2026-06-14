import { Tier } from "@/lib/types";
import { TIER_COLORS, TIER_LABELS } from "@/lib/utils";

export function TierBadge({ tier }: { tier: Tier }) {
  const color = TIER_COLORS[tier];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color, backgroundColor: `${color}1A`, border: `1px solid ${color}40` }}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
