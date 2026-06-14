import { MessageItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/utils";

export function MessageTable({ messages }: { messages: MessageItem[] }) {
  if (messages.length === 0) {
    return <div className="card p-8 text-center text-text-muted text-sm">No messages yet.</div>;
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-border">
              {["Customer", "Status", "Message"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">
                  {m.customer_name || "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge color={STATUS_COLORS[m.status]}>{m.status}</Badge>
                  {m.failed_reason && (
                    <span className="text-xs text-text-muted ml-2">({m.failed_reason.replace(/_/g, " ")})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-secondary max-w-md truncate">{m.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
