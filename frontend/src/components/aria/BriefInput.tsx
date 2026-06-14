"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_BRIEFS = [
  "Win back customers who spent over ₹4000 but haven't bought in 60 days. Diwali sale vibe.",
  "Reward our Platinum and Gold customers in Mumbai with early access to the new Western Wear collection.",
  "Re-engage customers who bought Ethnic Wear over 90 days ago with a festive discount.",
];

export function BriefInput({
  onSubmit,
  isLoading,
}: {
  onSubmit: (brief: string) => void;
  isLoading: boolean;
}) {
  const [brief, setBrief] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (brief.trim().length < 10) return;
    onSubmit(brief.trim());
  };

  return (
    <div
      className="card ai-shimmer p-6 transition-all duration-300"
      style={{
        background: "rgba(10, 11, 18, 0.7)",
        borderColor: focused ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.06)",
        boxShadow: focused
          ? "0 0 0 1px rgba(124,58,237,0.15), 0 0 40px -8px rgba(124,58,237,0.2)"
          : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.15) 100%)",
            boxShadow: "0 0 16px rgba(124,58,237,0.35)",
          }}
        >
          <Sparkles size={18} style={{ color: "#C4B5FD" }} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Brief ARIA</h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Describe your campaign goal — ARIA builds the audience, writes the messages, and estimates results
          </p>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="e.g. Win back customers who haven't ordered in 60 days and spend over ₹3000 on average. Festive, warm tone."
        rows={4}
        disabled={isLoading}
        className="w-full rounded-xl px-4 py-3.5 text-sm outline-none resize-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(255,255,255,0.9)",
          caretColor: "#A78BFA",
        }}
      />

      {/* Actions row */}
      <div className="flex items-center justify-between mt-4">
        {/* Example brief chips */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_BRIEFS.map((example, i) => (
            <button
              key={i}
              onClick={() => setBrief(example)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
              style={{
                color: "rgba(167,139,250,0.7)",
                border: "1px solid rgba(124,58,237,0.2)",
                background: "rgba(124,58,237,0.05)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.4)";
                (e.currentTarget as HTMLButtonElement).style.color = "#A78BFA";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.2)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(167,139,250,0.7)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.05)";
              }}
            >
              <Zap size={10} />
              {example.slice(0, 36)}…
            </button>
          ))}
        </div>

        <Button variant="ai" onClick={handleSubmit} disabled={isLoading || brief.trim().length < 10}
          className="btn-ai-pulse flex-shrink-0 ml-3">
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Building plan...
            </>
          ) : (
            <>
              Build Campaign
              <ArrowRight size={15} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
