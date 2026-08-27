import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// UNUSED — the app moved to a single flat 10/month quota for every account,
// so there's no paid tier to switch into. Left in place (and the DB's
// `plan`/`subscriptions` schema untouched) in case paid plans come back
// later; nothing in the UI calls this route anymore.
//
// Mock "upgrade" endpoint — flips the user's plan between free/pro without
// a real payment. Swap this for a Stripe Checkout session + webhook to go
// live; the schema (subscriptions table) is already in place for that.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();
  if (plan !== "free" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const { error } = await supabase.from("users").update({ plan }).eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update plan." }, { status: 500 });
  }

  return NextResponse.json({ plan });
}
