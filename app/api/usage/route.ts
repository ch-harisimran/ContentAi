import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MONTHLY_GENERATION_LIMIT } from "@/lib/constants";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("variation_index", 0)
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    return NextResponse.json({ error: "Failed to load usage." }, { status: 500 });
  }

  return NextResponse.json({
    used: count ?? 0,
    limit: MONTHLY_GENERATION_LIMIT,
    remaining: Math.max(0, MONTHLY_GENERATION_LIMIT - (count ?? 0)),
  });
}
