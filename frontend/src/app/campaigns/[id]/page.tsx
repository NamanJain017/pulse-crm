"use client";

import { useParams } from "next/navigation";
import { Sparkles, Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/campaigns/StatusBadge";
import { FunnelChart } from "@/components/campaigns/FunnelChart";
import { DeliveryStream } from "@/components/campaigns/DeliveryStream";
import { MetricCard } from "@/components/campaigns/MetricCard";
import { MessageTable } from "@/components/campaigns/MessageTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaignAnalytics, useCampaignMessages } from "@/hooks/useCampaigns";
import { formatCurrency, formatPercent, formatDateTime, CHANNEL_LABELS } from "@/lib/utils";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const { data: analytics, isLoading } = useCampaignAnalytics(campaignId);
  const { data: messages } = useCampaignMessages(campaignId);

  if (isLoading || !analytics) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="h-10 w-64 bg-elevated rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse" />
          ))}
        </div>
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  const { campaign } = analytics;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={campaign.name}
        description={campaign.description || campaign.nl_brief || undefined}
        actions={<StatusBadge status={campaign.status} />}
      />

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
        {campaign.ai_generated && (
          <span className="flex items-center gap-1.5 text-violet-soft">
            <Sparkles size={14} /> ARIA-generated
          </span>
        )}
        <span>{CHANNEL_LABELS[campaign.channel] || campaign.channel}</span>
        {campaign.launched_at && (
          <span className="flex items-center gap-1.5">
            <Calendar size={14} /> Launched {formatDateTime(campaign.launched_at)}
          </span>
        )}
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Delivery Rate" value={formatPercent(analytics.delivery_rate)} color="#10B981" />
        <MetricCard label="Open Rate" value={formatPercent(analytics.open_rate)} color="#A78BFA" />
        <MetricCard label="Click Rate" value={formatPercent(analytics.click_rate)} color="#7C3AED" />
        <MetricCard label="Revenue Attributed" value={formatCurrency(campaign.revenue_attributed)} color="#F59E0B" />
      </div>

      {/* AI Insight */}
      {analytics.ai_insight && (
        <div className="card p-5 mb-6 bg-gradient-to-br from-violet/10 to-transparent border-violet/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-violet-soft" />
            </div>
            <div>
              <div className="text-xs font-semibold text-violet-soft uppercase tracking-wide mb-1">
                AI Insight
              </div>
              <p className="text-sm text-text-primary leading-relaxed">{analytics.ai_insight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Funnel + Live Stream */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Funnel</CardTitle>
          </CardHeader>
          <FunnelChart campaign={campaign} />
        </Card>

        <DeliveryStream campaignId={campaignId} isRunning={campaign.status === "running"} />
      </div>

      {/* Messages table */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Messages ({campaign.total_sent})
        </h3>
      </div>
      <MessageTable messages={messages || []} />
    </div>
  );
}
