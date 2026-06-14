"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DailyReach } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function ReachChart({ data }: { data: DailyReach[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    Sent: d.messages_sent,
    Delivered: d.delivered,
    Opened: d.opened,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Reach (Last 30 Days)</CardTitle>
      </CardHeader>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-text-muted text-sm">
          No campaigns launched yet — reach data will appear here.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
            <XAxis dataKey="date" stroke="#8B949E" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8B949E" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1C2333", border: "1px solid #30363D", borderRadius: 8 }}
              labelStyle={{ color: "#E6EDF3" }}
            />
            <Bar dataKey="Sent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Delivered" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Opened" fill="#A78BFA" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
