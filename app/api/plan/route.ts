import { NextResponse } from "next/server";

// Retired: the app moved to a single flat monthly quota for every account
// (see lib/constants.ts MONTHLY_GENERATION_LIMIT), so there's no paid tier
// to switch into anymore. Nothing in the UI calls this route. Kept as a
// route (rather than deleted) only so a stray request gets an explicit
// "this is gone" response instead of a generic 404 — it no longer touches
// the database in any way.
export async function POST() {
  return NextResponse.json({ error: "This endpoint has been retired." }, { status: 410 });
}
