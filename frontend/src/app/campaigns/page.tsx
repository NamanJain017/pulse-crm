"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { useCampaigns } from "@/hooks/useCampaigns";

export default function CampaignsPage() {
  const [status, setStatus] = useState("");
  const { data: campaigns, isLoading } = useCampaigns(status || undefined);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Campaigns"
        description="All your marketing campaigns, AI-generated and manual"
        actions={
          <Link href="/campaigns/new">
            <Button variant="ai">
              <Plus size={16} />
              New Campaign
            </Button>
          </Link>
        }
      />

      <div className="mb-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="card h-64 animate-pulse" />
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="card p-12 text-center">
          <Megaphone size={32} className="text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold text-text-primary mb-1">No campaigns yet</h3>
          <p className="text-sm text-text-secondary mb-4">
            Create your first campaign manually, or brief ARIA to build one for you.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/aria">
              <Button variant="ai">Brief ARIA</Button>
            </Link>
            <Link href="/campaigns/new">
              <Button variant="secondary">New Campaign</Button>
            </Link>
          </div>
        </div>
      ) : (
        <CampaignTable campaigns={campaigns} />
      )}
    </div>
  );
}
