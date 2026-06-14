"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Campaign } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatNumber, formatCurrency, formatPercent, formatRelativeTime, CHANNEL_LABELS } from "@/lib/utils";

export function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Campaign", "Channel", "Status", "Recipients", "Delivered", "Opened", "Revenue", "Created"].map((h) => (
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
