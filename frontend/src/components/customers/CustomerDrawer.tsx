"use client";

import { X, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";
import { useCustomer } from "@/hooks/useCampaigns";
import { TierBadge } from "./TierBadge";
import { formatCurrency, formatDate, CHANNEL_LABELS } from "@/lib/utils";

export function CustomerDrawer({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { data: customer, isLoading } = useCustomer(customerId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border-l border-border h-full overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Customer Details</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        {isLoading || !customer ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-elevated rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">{customer.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Customer since {formatDate(customer.created_at)}
                </p>
              </div>
              <TierBadge tier={customer.tier} />
            </div>

            {/* Contact info */}
            <div className="space-y-2 mb-5">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Mail size={14} /> {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone size={14} /> {customer.phone}
                </div>
              )}
              {customer.city && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin size={14} /> {customer.city}
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatBox label="Total Spend" value={formatCurrency(customer.total_spend)} />
              <StatBox label="Total Orders" value={String(customer.total_orders)} />
              <StatBox label="Avg Order Value" value={formatCurrency(customer.avg_order_value)} />
              <StatBox label="Preferred Channel" value={CHANNEL_LABELS[customer.preferred_channel]} />
            </div>

            {/* Order history */}
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-2">
              <ShoppingBag size={14} /> Order History ({customer.orders.length})
            </div>
            <div className="space-y-2">
              {customer.orders
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((order) => (
                  <div key={order.id} className="bg-elevated rounded-lg p-3 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-text-secondary">{order.order_number}</span>
                      <span className="text-sm font-mono font-semibold text-text-primary">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted">{formatDate(order.created_at)} · {order.status}</div>
                    {order.items.length > 0 && (
                      <div className="text-xs text-text-secondary mt-1">
                        {order.items.map((item) => item.product).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-elevated rounded-lg p-3 border border-border">
      <div className="text-[10px] text-text-muted uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-mono font-semibold text-text-primary">{value}</div>
    </div>
  );
}
