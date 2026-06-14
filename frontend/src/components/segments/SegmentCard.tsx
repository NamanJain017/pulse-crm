import { Users, Sparkles, User } from "lucide-react";
import { Segment } from "@/lib/types";
import { formatNumber, formatDate } from "@/lib/utils";

export function SegmentCard({ segment, onClick }: { segment: Segment; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left hover:border-violet/40 transition-colors w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary pr-2">{segment.name}</h3>
        {segment.created_by === "aria" ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-soft bg-violet/10 border border-violet/30 rounded-full px-2 py-0.5 flex-shrink-0">
            <Sparkles size={10} /> ARIA
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary bg-elevated border border-border rounded-full px-2 py-0.5 flex-shrink-0">
            <User size={10} /> Manual
          </span>
        )}
      </div>

      {segment.description && (
        <p className="text-xs text-text-secondary mb-4 line-clamp-2 leading-relaxed">
          {segment.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <Users size={14} className="text-text-secondary" />
          <span className="font-mono font-semibold text-text-primary">
            {formatNumber(segment.customer_count)}
          </span>
          <span className="text-text-muted">customers</span>
        </div>
        <span className="text-xs text-text-muted">{formatDate(segment.created_at)}</span>
      </div>
    </button>
  );
}
