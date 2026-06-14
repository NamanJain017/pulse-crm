"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BriefInput } from "@/components/aria/BriefInput";
import { PlanCard } from "@/components/aria/PlanCard";
import { useAriaBrief, useAriaApprove } from "@/hooks/useCampaigns";
import { ApiError } from "@/lib/api";

export default function AriaPage() {
  const router = useRouter();
  const briefMutation = useAriaBrief();
  const approveMutation = useAriaApprove();
  const [launched, setLaunched] = useState<string | null>(null);

  const handleSubmit = (brief: string) => {
    setLaunched(null);
    briefMutation.mutate(brief);
  };

  const handleApprove = () => {
    if (!briefMutation.data) return;
    approveMutation.mutate(briefMutation.data.plan_id, {
      onSuccess: (res) => {
        setLaunched(res.campaign_id);
      },
    });
  };

  const handleDiscard = () => {
    briefMutation.reset();
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <PageHeader
        title="ARIA"
        description="Tell ARIA what you want to achieve. It builds the audience, writes the messages, and runs the campaign."
      />

      <div className="space-y-4">
        <BriefInput onSubmit={handleSubmit} isLoading={briefMutation.isPending} />

        {briefMutation.isError && (
          <div className="card p-4 border-rose/30 bg-rose/5 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-rose">ARIA couldn't build this plan</div>
              <div className="text-sm text-text-secondary mt-1">
                {briefMutation.error instanceof ApiError
                  ? briefMutation.error.message
                  : "Something went wrong. Try rephrasing your brief."}
              </div>
            </div>
          </div>
        )}

        {launched ? (
          <div className="card p-6 border-emerald/30 bg-emerald/5 flex items-start gap-3 animate-slide-up">
            <CheckCircle2 size={20} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-emerald">Campaign launched!</div>
              <div className="text-sm text-text-secondary mt-1">
                ARIA created the segment, generated personalized messages, and dispatched the campaign.
              </div>
              <button
                onClick={() => router.push(`/campaigns/${launched}`)}
                className="text-sm text-violet-soft hover:underline mt-2 inline-block"
              >
                View live delivery stream →
              </button>
            </div>
          </div>
        ) : (
          briefMutation.data && (
            <PlanCard
              plan={briefMutation.data}
              onApprove={handleApprove}
              onDiscard={handleDiscard}
              isApproving={approveMutation.isPending}
            />
          )
        )}

        {approveMutation.isError && (
          <div className="card p-4 border-rose/30 bg-rose/5 text-sm text-rose">
            {approveMutation.error instanceof ApiError
              ? approveMutation.error.message
              : "Launch failed. Please try again."}
          </div>
        )}
      </div>
    </div>
  );
}
