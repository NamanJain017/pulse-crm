import { CampaignStatus } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/utils";

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
      style={{ color, backgroundColor: `${color}1A`, border: `1px solid ${color}40` }}
    >
      {status === "running" && <span className="live-dot" />}
      {status}
    </span>
  );
}
