import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: string;
  sublabel?: string;
}

export function StatCard({ label, value, icon: Icon, accent = "#3B82F6", sublabel }: StatCardProps) {
  return (
    <div
      className="card stat-card p-5 group cursor-default"
      style={{ "--accent-color": accent } as React.CSSProperties}
    >
      {/* Glowing top accent bar */}
      <div
        className="absolute top-0 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${accent}18`, boxShadow: `0 0 0 1px ${accent}22` }}
        >
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>

      <div className="text-2xl font-bold font-mono text-white tracking-tight">{value}</div>
      {sublabel && (
        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{sublabel}</div>
      )}
    </div>
  );
}
