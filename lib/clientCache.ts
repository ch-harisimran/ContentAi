"use client";

// A tiny in-memory cache shared across client-side navigations within one
// browser tab. Next.js App Router navigations between our pages don't
// reload the JS runtime, so this module-level store persists for as long
// as the tab stays open — meaning a page can read data that was already
// fetched elsewhere (e.g. warmed right after login) instead of re-fetching
// and flashing a spinner every time the user switches tabs.
//
// Deliberately not a React Context: these pages (dashboard/history/
// templates/analytics/settings) are separate top-level routes without a
// shared layout, so there's no single component tree to hang a Provider
// on. A module singleton works regardless of which page is mounted.

type Listener = () => void;

const store = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();
const listeners = new Map<string, Set<Listener>>();

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, data: T) {
  store.set(key, data);
  notify(key);
}

export function invalidateCached(key: string) {
  store.delete(key);
  notify(key);
}

/**
 * Mutate a cached value in place (e.g. after a delete or a locally-known
 * insert). Works even if nothing is cached yet for `key` — `prev` is
 * `undefined` in that case, so callers should handle that (e.g. `prev?.x
 * ?? []`) rather than assuming a fetch has already landed.
 */
export function updateCached<T>(key: string, updater: (prev: T | undefined) => T) {
  store.set(key, updater(store.get(key) as T | undefined));
  notify(key);
}

/**
 * Fetches `url` and caches the parsed JSON under `key`. Returns the cached
 * value immediately if present. Concurrent callers for the same key share
 * one in-flight request instead of firing duplicates.
 */
export async function fetchCached<T>(key: string, url: string): Promise<T> {
  if (store.has(key)) return store.get(key) as T;

  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fetch(url)
    .then((res) => res.json())
    .then((data) => {
      setCached(key, data);
      inflight.delete(key);
      return data as T;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export function subscribeCached(key: string, fn: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => listeners.get(key)?.delete(fn);
}
