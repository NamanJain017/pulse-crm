"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, Megaphone, Users, Filter, Settings, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/aria", label: "AI Insights", icon: Sparkles },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/segments", label: "Segments", icon: Filter },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="w-64 h-screen flex flex-col fixed left-0 top-0"
      style={{
        background: "var(--bg-base)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}>

      {/* Brand */}
      <div className="px-6 py-8">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-4xl leading-none tracking-tight">
            <span className="text-gradient">Pulse</span><br />
            <span className="text-[#d4e4fa]">CRM</span>
          </div>
          <div className="text-[11px] font-semibold tracking-wide mt-2" style={{ color: "rgba(212,228,250,0.5)" }}>
            AI-NATIVE MARKETING
          </div>
        </div>
      </div>

      {/* New Campaign Button — links to Campaigns page */}
      <div className="px-6 pb-6">
        <Link href="/campaigns">
          <Button className="w-full justify-center gap-2 bg-[#4edea3] hover:bg-[#3dcca1] text-[#003824] border-none font-semibold shadow-[0_0_20px_rgba(78,222,163,0.25)] rounded-lg py-5">
            <Megaphone size={16} /> New Campaign
          </Button>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = isActivePath(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "text-[#d4e4fa]"
                  : "text-[#86948a] hover:text-[#d4e4fa] hover:bg-white/5"
              )}
              style={isActive ? {
                background: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
                borderLeft: "2px solid #d0bcff"
              } : {}}
            >
              {isActive && (
                <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#d0bcff] shadow-[0_0_8px_#d0bcff]" />
              )}
              <Icon size={18} style={isActive ? { color: "#d0bcff" } : {}} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-4 py-6 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { href: "/help", label: "Help Center", icon: HelpCircle },
          { href: "/account", label: "Account", icon: User },
        ].map((item) => {
          const isActive = isActivePath(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "text-[#d4e4fa]"
                  : "text-[#86948a] hover:text-[#d4e4fa] hover:bg-white/5"
              )}
              style={isActive ? {
                background: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
                borderLeft: "2px solid #d0bcff"
              } : {}}
            >
              {isActive && (
                <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#d0bcff] shadow-[0_0_8px_#d0bcff]" />
              )}
              <Icon size={18} style={isActive ? { color: "#d0bcff" } : {}} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
