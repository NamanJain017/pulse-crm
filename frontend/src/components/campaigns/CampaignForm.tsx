"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { useSegments, useCreateCampaign, useLaunchCampaign } from "@/hooks/useCampaigns";
import { formatNumber } from "@/lib/utils";

export function CampaignForm() {
  const router = useRouter();
  const { data: segments, isLoading: segmentsLoading } = useSegments();
  const createMutation = useCreateCampaign();
  const launchMutation = useLaunchCampaign();

  const [name, setName] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [personalizationMode, setPersonalizationMode] = useState("per_customer");
  const [template, setTemplate] = useState("Hi {name}! Check out KORA's latest collection — shop now.");

  const selectedSegment = segments?.find((s) => s.id === segmentId);

  const handleSubmit = async () => {
    if (!name || !segmentId) return;

    const campaign = await createMutation.mutateAsync({
      name,
      segment_id: segmentId,
      channel,
      personalization_mode: personalizationMode,
      message_template: personalizationMode === "template" ? template : undefined,
    });

    await launchMutation.mutateAsync(campaign.id);
    router.push(`/campaigns/${campaign.id}`);
  };

  const isSubmitting = createMutation.isPending || launchMutation.isPending;

  return (
    <div className="card p-6 max-w-xl">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            Campaign Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Festive Season Reactivation"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            Audience
          </label>
          <Select value={segmentId} onChange={(e) => setSegmentId(e.target.value)} className="w-full">
            <option value="">Select a segment...</option>
            {segments?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({formatNumber(s.customer_count)} customers)
              </option>
            ))}
          </Select>
          {segments?.length === 0 && !segmentsLoading && (
            <p className="text-xs text-text-muted mt-1.5">
              No segments yet — create one on the Segments page first.
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            Channel
          </label>
          <Select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full">
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="rcs">RCS</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            Message Personalization
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setPersonalizationMode("per_customer")}
              className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${
                personalizationMode === "per_customer"
                  ? "border-violet bg-violet/10 text-violet-soft"
                  : "border-border bg-elevated text-text-secondary"
              }`}
            >
              ✦ AI Per-Customer
            </button>
            <button
              onClick={() => setPersonalizationMode("template")}
              className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${
                personalizationMode === "template"
                  ? "border-violet bg-violet/10 text-violet-soft"
                  : "border-border bg-elevated text-text-secondary"
              }`}
            >
              Template
            </button>
          </div>
          {personalizationMode === "per_customer" ? (
            <p className="text-xs text-text-muted mt-1.5">
              AI will generate a unique message for each customer based on their purchase history and tier.
            </p>
          ) : (
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={3}
              className="w-full mt-2 rounded-lg bg-elevated border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-violet outline-none resize-none"
              placeholder="Use {name} for the customer's first name"
            />
          )}
        </div>

        <Button
          variant="ai"
          size="lg"
          onClick={handleSubmit}
          disabled={!name || !segmentId || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Send size={16} />
              Create & Launch Campaign
            </>
          )}
        </Button>

        {(createMutation.isError || launchMutation.isError) && (
          <div className="text-sm text-rose">
            Something went wrong launching the campaign. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
