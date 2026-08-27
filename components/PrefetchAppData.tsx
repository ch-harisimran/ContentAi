"use client";

import { useEffect } from "react";
import { warmAppData } from "@/lib/warmAppData";

// Renders nothing. Fires once on mount to warm the shared client cache for
// History/Templates/Analytics/Settings in the background — covers landing
// on /dashboard without going through the login form (existing session,
// bookmark, hard refresh), where the login page's blocking prefetch never
// ran. Doesn't block or delay anything on the page it's mounted in;
// fetchCached() no-ops for whichever keys are already warm.
export default function PrefetchAppData() {
  useEffect(() => {
    warmAppData();
  }, []);

  return null;
}
