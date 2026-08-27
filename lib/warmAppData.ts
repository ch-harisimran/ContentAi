"use client";

import { fetchCached } from "@/lib/clientCache";

// Cache keys shared with the pages that read them via useCachedData —
// keep these in sync with HistoryTable / TemplatesList / AnalyticsCharts /
// UsageBar.
export const HISTORY_ALL_KEY = "history:all";
export const TEMPLATES_KEY = "templates";
export const ANALYTICS_KEY = "analytics";
export const USAGE_KEY = "usage";

/**
 * Fetches every tab's data once, in parallel, and drops it in the shared
 * client cache — so by the time the user actually clicks into History,
 * Templates, Analytics, or Settings, it's already there and renders
 * instantly instead of showing its own spinner.
 *
 * Called two ways:
 *  - Blocking, from the login form: awaited before the redirect to
 *    /dashboard, so the whole app's data is ready the moment it appears.
 *  - Fire-and-forget, from the dashboard on mount: covers a user who
 *    lands on /dashboard without going through the login form (an
 *    existing session, a bookmark, a hard refresh) — warms the cache in
 *    the background without delaying the page they're already looking at.
 *
 * Failures are swallowed here on purpose: a broken endpoint should never
 * block login, and each page still knows how to fetch its own data if the
 * cache comes up empty.
 */
export async function warmAppData(): Promise<void> {
  await Promise.allSettled([
    fetchCached(HISTORY_ALL_KEY, "/api/history?content_type=all"),
    fetchCached(TEMPLATES_KEY, "/api/templates"),
    fetchCached(ANALYTICS_KEY, "/api/analytics"),
    fetchCached(USAGE_KEY, "/api/usage"),
  ]);
}

/** Same as warmAppData(), but gives up waiting after `ms` — used on the
 * login path so one slow endpoint can't strand the user on the login
 * screen indefinitely. Whatever did finish is still in the cache either
 * way; this only bounds how long we block the redirect. */
export function warmAppDataWithTimeout(ms = 6000): Promise<void> {
  return Promise.race([warmAppData(), new Promise<void>((resolve) => setTimeout(resolve, ms))]);
}
