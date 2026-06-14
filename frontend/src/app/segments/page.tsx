"use client";

import { useState } from "react";
import { Plus, X, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { SegmentCard } from "@/components/segments/SegmentCard";
import { SegmentModal } from "@/components/segments/NLSegmentInput";
import { RuleBuilder } from "@/components/segments/RuleBuilder";
import { useSegments, useSegmentPreview } from "@/hooks/useCampaigns";
import { Segment } from "@/lib/types";
import { formatNumber, TIER_LABELS } from "@/lib/utils";

export default function SegmentsPage() {
  const { data: segments, isLoading } = useSegments();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Segment | null>(null);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Segments"
        description="Reusable audience definitions — built manually or by ARIA"
        actions={
          <Button variant="ai" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            New Segment
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-32 animate-pulse" />
          ))}
        </div>
      ) : !segments || segments.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={32} className="text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold text-text-primary mb-1">No segments yet</h3>
          <p className="text-sm text-text-secondary mb-4">
            Create your first audience segment manually, or let ARIA build one from a brief.
          </p>
          <Button variant="ai" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            New Segment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {segments.map((segment) => (
            <SegmentCard key={segment.id} segment={segment} onClick={() => setSelected(segment)} />
          ))}
        </div>
      )}

      {showModal && <SegmentModal onClose={() => setShowModal(false)} />}
      {selected && <SegmentDetailModal segment={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function SegmentDetailModal({ segment, onClose }: { segment: Segment; onClose: () => void }) {
  const { data: preview, isLoading } = useSegmentPreview(segment.id);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">{segment.name}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        {segment.ai_rationale && (
          <div className="bg-violet/5 border border-violet/20 rounded-lg p-3 mb-4">
            <div className="text-xs font-semibold text-violet-soft mb-1">AI Rationale</div>
            <p className="text-sm text-text-secondary leading-relaxed">{segment.ai_rationale}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Filter Rules
          </div>
          <RuleBuilder rules={segment.rules} />
        </div>

        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Matching Customers ({formatNumber(preview?.total_matched ?? segment.customer_count)})
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-elevated rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {preview?.customers.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-sm bg-elevated rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-text-primary font-medium">{c.name}</span>
                  <span className="text-text-muted ml-2">{c.city}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span>{TIER_LABELS[c.tier]}</span>
                  <span className="font-mono">₹{formatNumber(c.total_spend)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
