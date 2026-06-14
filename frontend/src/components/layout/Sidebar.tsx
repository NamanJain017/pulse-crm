"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, Megaphone, Users, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/aria", label: "ARIA", icon: Sparkles, highlight: true },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/segments", label: "Segments", icon: Filter },
  { href: "/customers", label: "Customers", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen flex flex-col fixed left-0 top-0"
      style={{
        background: "rgba(7, 9, 14, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}>

      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          {/* Gradient logo mark */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
              boxShadow: "0 0 14px rgba(124,58,237,0.45)",
            }}>
            P
          </div>
          <div>
            <div className="font-bold text-white leading-none tracking-tight">PULSE</div>
            <div className="text-[10px] mt-0.5" style={{ color: "rgba(167,139,250,0.7)" }}>for KORA</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? item.highlight
                    ? "text-violet-soft"
                    : "text-white"
                  : "text-text-secondary hover:text-white"
              )}
              style={isActive ? {
                background: item.highlight
                  ? "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(124,58,237,0.05) 100%)"
                  : "rgba(255,255,255,0.06)",
                boxShadow: item.highlight ? "inset 0 0 0 1px rgba(124,58,237,0.25)" : "inset 0 0 0 1px rgba(255,255,255,0.06)",
              } : {}}
            >
              <Icon size={16} style={isActive && item.highlight ? { color: "#A78BFA" } : {}} />
              {item.label}
              {item.highlight && !isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "#7C3AED", boxShadow: "0 0 4px rgba(124,58,237,0.8)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 text-[10px]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" }}>
        PULSE CRM · Mini CRM for D2C brands
      </div>
    </aside>
  );
}
