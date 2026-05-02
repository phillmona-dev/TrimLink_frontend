"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "@/components/common/card";

export function RevenueChart({
  title,
  data
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">Performance snapshot across the current period.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trimRevenue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#18b6c4" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#18b6c4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.15} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#18b6c4"
              strokeWidth={3}
              fill="url(#trimRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
