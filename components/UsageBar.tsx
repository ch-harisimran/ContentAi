"use client";

import { useCachedData } from "@/lib/useCachedData";
import { USAGE_KEY } from "@/lib/warmAppData";

interface Usage {
  used: number;
  limit: number;
  remaining: number;
}

export default function UsageBar() {
  const usage = useCachedData<Usage>(USAGE_KEY, "/api/usage");

  if (!usage) {
    return <div className="editorial-card h-24 animate-pulse" />;
  }

  const pct = usage.limit > 0 ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  return (
    <div className="editorial-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-ink">Monthly usage</span>
        <span className="font-mono text-xs text-ink-faint">
          {usage.used} / {usage.limit} generations this month
        </span>
      </div>
      <div className="h-[3px] w-full bg-hairline">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2.5 text-xs text-ink-faint">Resets on the 1st of each month.</p>
    </div>
  );
}
