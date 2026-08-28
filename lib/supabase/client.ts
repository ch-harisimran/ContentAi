"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client — safe to use in "use client" components.
// Only ever uses the public anon key.
//
// Deliberately NOT passing the `Database` generic — see the matching
// comment in lib/supabase/server.ts for why: it resolves to `never` rather
// than `any` on this installed supabase-js version and broke every typed
// query across the app. Row shapes are enforced manually via @/types/database.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
