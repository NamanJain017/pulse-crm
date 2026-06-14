import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

/**
 * A pill badge with a colored dot — used for status, tier, and channel labels.
 * Color is passed as a hex string and applied via inline style so we can
 * support dynamic palettes (tier colors, status colors) without generating
 * Tailwind classes at build time.
 */
export function Badge({ children, color = "#8B949E", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-elevated border border-border",
        className
      )}
      style={{ color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {children}
    </span>
  );
}

export function AIBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase",
        "bg-violet/10 text-violet-soft border border-violet/30",
        className
      )}
    >
      ✦ AI
    </span>
  );
}
