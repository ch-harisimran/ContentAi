import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the Supabase email-confirmation / password-recovery / OAuth
// redirect: exchanges the `code` query param for a session, then sends the
// user to `next` (defaults to /dashboard). `next` is restricted to an
// in-app path so this can't be used as an open redirect.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
