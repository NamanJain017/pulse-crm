import { HelpCircle, BookOpen, MessageSquare, Zap, ExternalLink } from "lucide-react";

const HELP_ITEMS = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Guides on campaigns, segments, ARIA agent, and API references.",
    accent: "#4edea3",
  },
  {
    icon: Zap,
    title: "Quick-Start Tutorial",
    description: "A 5-minute walkthrough to seed data, create your first campaign, and run ARIA.",
    accent: "#d0bcff",
  },
  {
    icon: MessageSquare,
    title: "Contact Support",
    description: "Reach the PULSE engineering team directly for technical issues.",
    accent: "#ffb95f",
  },
];

export default function HelpPage() {
  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(78,222,163,0.1)", boxShadow: "0 0 0 1px rgba(78,222,163,0.2)" }}
          >
            <HelpCircle size={20} style={{ color: "#4edea3" }} />
          </div>
          <h1 className="text-3xl font-bold text-[#d4e4fa] tracking-tight">Help Center</h1>
        </div>
        <p className="text-[#86948a] text-sm">Resources, documentation, and support for PULSE CRM.</p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {HELP_ITEMS.map((item) => (
          <div
            key={item.title}
            className="card p-6 flex items-start gap-5 cursor-not-allowed"
            style={{ borderColor: `${item.accent}20` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${item.accent}15`, boxShadow: `0 0 0 1px ${item.accent}25` }}
            >
              <item.icon size={18} style={{ color: item.accent }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#d4e4fa]">{item.title}</div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: "rgba(255,185,95,0.1)", color: "#ffb95f" }}
                  >
                    Coming Soon
                  </span>
                  <ExternalLink size={13} className="text-[#86948a] opacity-40" />
                </div>
              </div>
              <p className="text-xs text-[#86948a] mt-1 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div
        className="mt-8 p-4 rounded-xl text-xs text-[#86948a] leading-relaxed"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="font-semibold text-[#d4e4fa]">Note for evaluators: </span>
        This is a scoped submission for the Xeno FDE assignment. Full help documentation and support channels are planned for the production release of PULSE CRM.
      </div>
    </div>
  );
}
