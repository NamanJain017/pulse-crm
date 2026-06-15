"use client";

import Link from "next/link";
import { Sparkles, Trash2 } from "lucide-react";
import { Campaign } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatNumber, formatCurrency, formatPercent, formatRelativeTime, CHANNEL_LABELS } from "@/lib/utils";
import { useDeleteCampaign } from "@/hooks/useCampaigns";

export function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  const deleteMutation = useDeleteCampaign();

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Campaign", "Channel", "Status", "Recipients", "Delivered", "Opened", "Revenue", "Created", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const deliveryRate = c.total_sent > 0 ? c.total_delivered / c.total_sent : 0;
              const openRate = c.total_delivered > 0 ? c.total_opened / c.total_delivered : 0;
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/campaigns/${c.id}`} className="font-medium text-text-primary hover:text-violet-soft flex items-center gap-2">
                      {c.ai_generated && <Sparkles size={12} className="text-violet-soft" />}
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{CHANNEL_LABELS[c.channel] || c.channel}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-text-primary">{formatNumber(c.total_recipients)}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary">
                    {formatNumber(c.total_delivered)} {c.total_sent > 0 && `(${formatPercent(deliveryRate)})`}
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">
                    {formatNumber(c.total_opened)} {c.total_delivered > 0 && `(${formatPercent(openRate)})`}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald">{formatCurrency(c.revenue_attributed)}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{formatRelativeTime(c.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete campaign "${c.name}"?`)) {
                          deleteMutation.mutate(c.id);
                        }
                      }}
                      className="text-text-muted hover:text-rose p-1 rounded hover:bg-rose/10 transition-colors inline-flex items-center justify-center"
                      title="Delete Campaign"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
