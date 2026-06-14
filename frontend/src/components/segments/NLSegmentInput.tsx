"use client";

import { useState } from "react";
import { X, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSegmentFromBrief } from "@/hooks/useCampaigns";
import { formatNumber } from "@/lib/utils";

export function SegmentModal({ onClose }: { onClose: () => void }) {
  const [brief, setBrief] = useState("");
  const [name, setName] = useState("");
  const createMutation = useCreateSegmentFromBrief();

  const handlePreview = () => {
    if (brief.trim().length < 10) return;
    createMutation.mutate({ brief: brief.trim(), save: false });
  };

  const handleSave = () => {
    createMutation.mutate(
      { brief: brief.trim(), save: true, name: name || undefined },
      { onSuccess: () => onClose() }
    );
  };

  const preview = createMutation.data;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-soft" />
            <h2 className="text-base font-semibold text-text-primary">New Segment</h2>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-text-secondary mb-3">
          Describe the audience in plain English. AI will translate it into filter rules.
        </p>

        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g. Platinum and Gold customers in Bangalore who bought Footwear in the last 90 days"
          rows={3}
          className="w-full rounded-lg bg-elevated border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-violet outline-none resize-none mb-3"
        />

        {!preview && (
          <Button
            variant="ai"
            onClick={handlePreview}
            disabled={createMutation.isPending || brief.trim().length < 10}
            className="w-full"
          >
            {createMutation.isPending ? "Thinking..." : "Preview Segment"}
          </Button>
        )}

        {createMutation.isError && (
          <div className="text-sm text-rose mt-2">
            Couldn't parse this brief. Try being more specific (e.g. mention spend amounts, tiers, or categories).
          </div>
        )}

        {preview && (
          <div className="animate-slide-up space-y-3 mt-3">
            <div className="bg-elevated rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-text-secondary" />
                <span className="font-mono font-semibold text-text-primary">
                  {formatNumber(preview.customer_count)}
                </span>
                <span className="text-xs text-text-muted">customers match</span>
              </div>
              {preview.ai_rationale && (
                <p className="text-xs text-text-secondary leading-relaxed mt-1">{preview.ai_rationale}</p>
              )}
            </div>

            <Input
              placeholder={preview.name || "Segment name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex gap-2">
              <Button variant="ai" onClick={handleSave} className="flex-1">
                Save Segment
              </Button>
              <Button variant="ghost" onClick={() => createMutation.reset()}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
