import { Settings, Lock, Bell, Palette, Database, ChevronRight } from "lucide-react";

const SETTING_GROUPS = [
  {
    label: "Workspace",
    items: [
      { icon: Palette, title: "Appearance", description: "Theme, language, and display preferences" },
      { icon: Bell, title: "Notifications", description: "Email digests, alert thresholds, and AI reports" },
    ],
  },
  {
    label: "Security",
    items: [
      { icon: Lock, title: "Access & Permissions", description: "API keys, team roles, and OAuth integrations" },
      { icon: Database, title: "Data & Storage", description: "Retention policies, export, and GDPR controls" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(208,188,255,0.1)", boxShadow: "0 0 0 1px rgba(208,188,255,0.2)" }}
          >
            <Settings size={20} style={{ color: "#d0bcff" }} />
          </div>
          <h1 className="text-3xl font-bold text-[#d4e4fa] tracking-tight">Settings</h1>
        </div>
        <p className="text-[#86948a] text-sm ml-13">Manage your workspace, integrations, and preferences.</p>
      </div>

      {/* Setting Groups */}
      <div className="space-y-8">
        {SETTING_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#86948a] mb-3 px-1">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.title}
                  className="card p-5 flex items-center justify-between group cursor-not-allowed"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(212,228,250,0.06)" }}
                    >
                      <item.icon size={16} style={{ color: "#bbcabf" }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#d4e4fa]">{item.title}</div>
                      <div className="text-xs text-[#86948a] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: "rgba(255,185,95,0.1)", color: "#ffb95f" }}
                    >
                      Coming Soon
                    </span>
                    <ChevronRight size={14} className="text-[#86948a] opacity-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Version Footer */}
      <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-[#86948a]">PULSE CORE AI 2.4.0</span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" style={{ boxShadow: "0 0 6px #4edea3" }} />
          <span className="text-xs text-[#86948a]">All systems operational</span>
        </div>
      </div>
    </div>
  );
}
