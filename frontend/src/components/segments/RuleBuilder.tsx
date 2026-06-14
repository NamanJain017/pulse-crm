import { SegmentRuleTree, SegmentCondition } from "@/lib/types";

const FIELD_LABELS: Record<string, string> = {
  days_since_last_order: "Days since last order",
  total_spend: "Total spend",
  avg_order_value: "Avg order value",
  total_orders: "Total orders",
  tier: "Tier",
  preferred_cat: "Preferred category",
  city: "City",
  gender: "Gender",
  age: "Age",
  opted_out: "Opted out",
};

const OP_LABELS: Record<string, string> = {
  gte: "≥",
  lte: "≤",
  gt: ">",
  lt: "<",
  eq: "=",
  neq: "≠",
  in: "in",
};

function isConditionLeaf(node: SegmentCondition | SegmentRuleTree): node is SegmentCondition {
  return "field" in node;
}

export function RuleBuilder({ rules }: { rules: SegmentRuleTree }) {
  return (
    <div className="space-y-2">
      {rules.conditions.map((cond, i) => (
        <div key={i}>
          {isConditionLeaf(cond) ? (
            <div className="flex items-center gap-2 text-sm bg-elevated rounded-lg px-3 py-2 border border-border">
              <span className="text-text-primary font-medium">{FIELD_LABELS[cond.field] || cond.field}</span>
              <span className="text-violet-soft font-mono">{OP_LABELS[cond.op] || cond.op}</span>
              <span className="text-text-secondary font-mono">{String(cond.value)}</span>
            </div>
          ) : (
            <RuleBuilder rules={cond} />
          )}
          {i < rules.conditions.length - 1 && (
            <div className="text-center text-xs text-text-muted py-1 font-semibold">{rules.operator}</div>
          )}
        </div>
      ))}
    </div>
  );
}
