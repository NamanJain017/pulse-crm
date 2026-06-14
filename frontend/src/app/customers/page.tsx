"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerDrawer } from "@/components/customers/CustomerDrawer";
import { useCustomers } from "@/hooks/useCampaigns";
import { customersApi } from "@/lib/api";
import { Customer } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [sortBy, setSortBy] = useState("total_spend");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers({
    search: search || undefined,
    tier: tier || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
    page,
    page_size: 25,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description={data ? `${formatNumber(data.total)} shoppers in your KORA database` : "Loading..."}
        actions={
          <a href={customersApi.exportUrl()} download>
            <Button variant="secondary">
              <Download size={16} />
              Export CSV
            </Button>
          </a>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Tiers</option>
          <option value="platinum">Platinum</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="card h-96 animate-pulse" />
      ) : !data || data.customers.length === 0 ? (
        <div className="card p-12 text-center text-text-secondary text-sm">
          No customers found. Try adjusting your filters, or seed the database from the Dashboard.
        </div>
      ) : (
        <>
          <CustomerTable
            customers={data.customers}
            onSelect={setSelected}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-text-secondary">
              Page {data.page} of {data.total_pages} · {formatNumber(data.total)} customers
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {selected && <CustomerDrawer customerId={selected.id} onClose={() => setSelected(null)} />}
    </div>
  );
}
