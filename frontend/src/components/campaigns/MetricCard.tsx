export function MetricCard({ label, value, sublabel, color }: { label: string; value: string; sublabel?: string; color?: string }) {
  const accent = color || "#E6EDF3";
  return (
    <div
      className="card p-4 group cursor-default relative overflow-hidden"
      style={{ transition: "border-color 0.25s, box-shadow 0.25s" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}40`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px -8px ${accent}30`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </div>
      <div
        className="text-xl font-bold font-mono"
        style={{ color: accent, textShadow: `0 0 16px ${accent}44` }}
      >
        {value}
      </div>
      {sublabel && <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{sublabel}</div>}
    </div>
  );
}
