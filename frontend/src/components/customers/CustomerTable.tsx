"use client";

import { Customer } from "@/lib/types";
import { TierBadge } from "./TierBadge";
import { formatCurrency, formatNumber, formatDate, CHANNEL_LABELS } from "@/lib/utils";

interface CustomerTableProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  sortBy: string;
  sortDir: string;
  onSort: (field: string) => void;
}

const COLUMNS: { key: string; label: string; sortable?: boolean }[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "city", label: "City" },
  { key: "tier", label: "Tier" },
  { key: "preferred_cat", label: "Preferred Category" },
  { key: "total_orders", label: "Orders", sortable: true },
  { key: "total_spend", label: "Total Spend", sortable: true },
  { key: "days_since_last_order", label: "Last Order", sortable: true },
  { key: "preferred_channel", label: "Channel" },
];

export function CustomerTable({ customers, onSelect, sortBy, sortDir, onSort }: CustomerTableProps) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={`text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide ${
                    col.sortable ? "cursor-pointer hover:text-text-primary" : ""
                  }`}
                >
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="ml-1 text-violet-soft">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className="border-b border-border last:border-0 hover:bg-elevated cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                <td className="px-4 py-3 text-text-secondary">{c.city}</td>
                <td className="px-4 py-3">
                  <TierBadge tier={c.tier} />
                </td>
                <td className="px-4 py-3 text-text-secondary">{c.preferred_cat}</td>
                <td className="px-4 py-3 font-mono text-text-primary">{c.total_orders}</td>
                <td className="px-4 py-3 font-mono text-text-primary">{formatCurrency(c.total_spend)}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {c.days_since_last_order != null ? `${c.days_since_last_order}d ago` : "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">{CHANNEL_LABELS[c.preferred_channel]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
