"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { ChannelStats } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CHANNEL_LABELS } from "@/lib/utils";

export function ChannelRadar({ data }: { data: ChannelStats[] }) {
  const chartData = data.map((c) => ({
    channel: CHANNEL_LABELS[c.channel] || c.channel,
    "Delivery %": Math.round(c.delivery_rate * 100),
    "Open %": Math.round(c.open_rate * 100),
    "Click %": Math.round(c.click_rate * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance</CardTitle>
      </CardHeader>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-text-muted text-sm">
          Channel comparison appears after your first campaign.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#30363D" />
            <PolarAngleAxis dataKey="channel" stroke="#8B949E" fontSize={11} />
            <PolarRadiusAxis stroke="#30363D" fontSize={10} angle={30} domain={[0, 100]} />
            <Radar name="Delivery %" dataKey="Delivery %" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
            <Radar name="Open %" dataKey="Open %" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.15} />
            <Radar name="Click %" dataKey="Click %" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1C2333", border: "1px solid #30363D", borderRadius: 8 }}
              labelStyle={{ color: "#E6EDF3" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
