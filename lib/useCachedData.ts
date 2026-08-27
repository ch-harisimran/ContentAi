"use client";

import { useEffect, useState } from "react";
import { getCached, fetchCached, subscribeCached } from "@/lib/clientCache";

/**
 * Reads `key` from the shared client cache, kicking off a fetch of `url`
 * only if nothing is cached yet. If the data was already warmed (e.g. by
 * warmAppData() right after login), this returns it on the very first
 * render — no loading flash on tab switch.
 */
export function useCachedData<T>(key: string, url: string): T | undefined {
  const [data, setData] = useState<T | undefined>(() => getCached<T>(key));

  useEffect(() => {
    const unsub = subscribeCached(key, () => setData(getCached<T>(key)));
    if (getCached<T>(key) === undefined) {
      fetchCached<T>(key, url).catch(() => {
        /* surfaced as "still loading" — the page's own empty/loading state covers it */
      });
    } else {
      setData(getCached<T>(key));
    }
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url]);

  return data;
}
