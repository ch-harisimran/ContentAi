import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_TYPES } from "@/lib/constants";

const DAYS = 30;

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  // One row per batch (variation_index = 0) = one generation event.
  const { data, error } = await supabase
    .from("generations")
    .select("content_type, created_at")
    .eq("user_id", user.id)
    .eq("variation_index", 0)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 });
  }

  const rows = data ?? [];

  // Build a zero-filled day series so the chart doesn't have gaps.
  const dayBuckets: Record<string, number> = {};
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dayBuckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    if (key in dayBuckets) dayBuckets[key] += 1;
  }
  const byDay = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));

  // Breakdown by content type, zero-filled for every known type.
  const typeCounts: Record<string, number> = {};
  for (const c of CONTENT_TYPES) typeCounts[c.value] = 0;
  for (const row of rows) {
    typeCounts[row.content_type] = (typeCounts[row.content_type] ?? 0) + 1;
  }
  const byType = CONTENT_TYPES.map((c) => ({
    content_type: c.value,
    label: c.label,
    count: typeCounts[c.value] ?? 0,
  }));

  // Simple day-streak: consecutive days (ending today) with at least one generation.
  let streak = 0;
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (dayBuckets[key] > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  return NextResponse.json({
    totalLast30Days: rows.length,
    streak,
    byDay,
    byType,
  });
}
