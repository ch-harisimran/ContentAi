"use client";

import { useCachedData } from "@/lib/useCachedData";
import { ANALYTICS_KEY } from "@/lib/warmAppData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Flame, Sparkles } from "lucide-react";

interface AnalyticsData {
  totalLast30Days: number;
  streak: number;
  byDay: { date: string; count: number }[];
  byType: { content_type: string; label: string; count: number }[];
}

const TOOLTIP_STYLE = {
  background: "#111113",
  border: "1px solid rgba(241,237,227,0.15)",
  borderRadius: 2,
  color: "#f1ede3",
  fontSize: 12,
};

export default function AnalyticsCharts() {
  const data = useCachedData<AnalyticsData>(ANALYTICS_KEY, "/api/analytics");

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="editorial-card h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="editorial-card p-5">
          <p className="font-mono text-[11px] tracking-wide text-ink-faint">LAST 30 DAYS</p>
          <p className="mt-1.5 font-serif text-3xl font-medium">{data.totalLast30Days}</p>
          <p className="mt-1 text-sm text-ink-faint">generations</p>
        </div>
        <div className="editorial-card flex flex-col justify-between p-5">
          <p className="font-mono text-[11px] tracking-wide text-ink-faint">CURRENT STREAK</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Flame size={20} className="text-accent" />
            <span className="font-serif text-3xl font-medium">{data.streak}</span>
            <span className="text-sm text-ink-faint">day{data.streak === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div className="editorial-card p-5">
          <p className="font-mono text-[11px] tracking-wide text-ink-faint">MOST USED TYPE</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Sparkles size={17} className="text-accent" />
            <span className="font-serif text-lg font-medium">
              {[...data.byType].sort((a, b) => b.count - a.count)[0]?.label ?? "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="editorial-card p-5">
        <h3 className="mb-4 font-mono text-[11px] tracking-wide text-ink-faint">GENERATIONS — LAST 30 DAYS</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.byDay}>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5a36" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#ff5a36" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "#57544c", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
              interval={4}
              axisLine={{ stroke: "#232326" }}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fill: "#57544c", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#f1ede3" }} />
            <Area type="monotone" dataKey="count" stroke="#ff5a36" fill="url(#fillCount)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="editorial-card p-5">
        <h3 className="mb-4 font-mono text-[11px] tracking-wide text-ink-faint">BREAKDOWN BY CONTENT TYPE</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byType} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid horizontal={false} stroke="#1c1c1f" />
            <XAxis type="number" allowDecimals={false} tick={{ fill: "#57544c", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: "#8f8b82", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={150}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(241,237,227,0.04)" }} />
            <Bar dataKey="count" fill="#ff5a36" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
