import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, CHANNEL_LABELS, formatNumber, formatRelativeTime } from "@/lib/utils";
import { DashboardResponse } from "@/lib/types";

export function RecentCampaigns({ campaigns }: { campaigns: DashboardResponse["recent_campaigns"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Campaigns</CardTitle>
        <Link href="/campaigns" className="text-xs text-sky hover:underline">
          View all
        </Link>
      </CardHeader>

      {campaigns.length === 0 ? (
        <div className="py-8 text-center text-text-muted text-sm">
          No campaigns yet.{" "}
          <Link href="/aria" className="text-violet-soft hover:underline">
            Brief ARIA
          </Link>{" "}
          to create your first one.
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-elevated hover:bg-elevated/70 transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-text-primary">{c.name}</div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {CHANNEL_LABELS[c.channel] || c.channel} · {formatRelativeTime(c.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-mono text-text-primary">{formatNumber(c.total_recipients)}</div>
                  <div className="text-xs text-text-muted">recipients</div>
                </div>
                <Badge color={STATUS_COLORS[c.status]}>{c.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
