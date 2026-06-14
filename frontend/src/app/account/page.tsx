import { User, Shield, CreditCard, ChevronRight } from "lucide-react";

const PROFILE = {
  name: "Arjun Sharma",
  email: "arjun@kora.in",
  role: "Growth Director",
  plan: "Pro AI Plan",
  timezone: "GMT+5:30 (Mumbai)",
};

export default function AccountPage() {
  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(78,222,163,0.1)", boxShadow: "0 0 0 1px rgba(78,222,163,0.2)" }}
          >
            <User size={20} style={{ color: "#4edea3" }} />
          </div>
          <h1 className="text-3xl font-bold text-[#d4e4fa] tracking-tight">Account</h1>
        </div>
        <p className="text-[#86948a] text-sm">Your profile, plan, and workspace configuration.</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6 mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#86948a] mb-5">Profile Details</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: PROFILE.name },
            { label: "Email Address", value: PROFILE.email },
            { label: "Job Role", value: PROFILE.role },
            { label: "Timezone", value: PROFILE.timezone },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#86948a] mb-1.5">
                {field.label}
              </label>
              <div
                className="px-4 py-2.5 rounded-lg text-sm text-[#d4e4fa]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Card */}
      <div className="card p-6 mb-4" style={{ borderColor: "rgba(78,222,163,0.2)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#86948a] mb-1">Subscription</p>
            <div className="flex items-center gap-2 mt-2">
              <CreditCard size={16} style={{ color: "#4edea3" }} />
              <span className="text-lg font-bold text-[#d4e4fa]">{PROFILE.plan}</span>
            </div>
          </div>
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ background: "rgba(78,222,163,0.1)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.2)" }}
          >
            Active
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {["Unlimited AI Generations", "Priority 24/7 Support", "Multi-region API Hosting"].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-xs text-[#bbcabf]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4edea3" }} />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Security Row */}
      <div
        className="card p-5 flex items-center justify-between cursor-not-allowed"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <Shield size={16} style={{ color: "#d0bcff" }} />
          <div>
            <div className="text-sm font-medium text-[#d4e4fa]">Security & Access</div>
            <div className="text-xs text-[#86948a]">Password, 2FA, and session management</div>
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
    </div>
  );
}
