"use client";

import { Users, Megaphone, Send, IndianRupee, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReachChart } from "@/components/dashboard/ReachChart";
import { ChannelRadar } from "@/components/dashboard/ChannelRadar";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { Button } from "@/components/ui/button";
import { useDashboard, useSeedDatabase } from "@/hooks/useCampaigns";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const seedMutation = useSeedDatabase();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle size={32} className="text-rose mb-3" />
        <h2 className="text-lg font-semibold text-text-primary mb-1">No data yet</h2>
        <p className="text-sm text-text-secondary mb-4 max-w-sm">
          The database looks empty. Seed it with KORA's synthetic customer and order data to get started.
        </p>
        <Button variant="ai" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
          <Sparkles size={16} />
          {seedMutation.isPending ? "Seeding..." : "Seed KORA Data"}
        </Button>
      </div>
    );
  }

  const { stats, daily_reach, channel_stats, recent_campaigns, ai_insight } = data;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Your shopper engagement at a glance"
        actions={
          <Link href="/aria">
            <Button variant="ai">
              <Sparkles size={16} />
              Brief ARIA
            </Button>
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Customers" value={formatNumber(stats.total_customers)} icon={Users} accent="#3B82F6" />
        <StatCard
          label="Active Campaigns"
          value={String(stats.active_campaigns)}
          icon={Megaphone}
          accent="#A78BFA"
          sublabel={`${stats.total_campaigns} total`}
        />
        <StatCard
          label="Messages Sent (30d)"
          value={formatNumber(stats.messages_sent_30d)}
          icon={Send}
          accent="#10B981"
          sublabel={`${formatPercent(stats.avg_delivery_rate)} delivered`}
        />
        <StatCard
          label="Revenue Attributed (30d)"
          value={formatCurrency(stats.revenue_attributed_30d)}
          icon={IndianRupee}
          accent="#F59E0B"
        />
      </div>

      {/* AI Insight */}
      <div className="mb-6">
        <AIInsightCard insight={ai_insight} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ReachChart data={daily_reach} />
        <ChannelRadar data={channel_stats} />
      </div>

      {/* Recent campaigns */}
      <RecentCampaigns campaigns={recent_campaigns} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="h-10 w-64 bg-elevated rounded-lg animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 h-24 animate-pulse" />
        ))}
      </div>
      <div className="h-20 card animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="card h-72 animate-pulse" />
        <div className="card h-72 animate-pulse" />
      </div>
    </div>
  );
}
