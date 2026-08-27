// Simple in-memory per-user rate limit for /api/generate. Good enough for a
// single-instance / portfolio deployment — swap for Upstash Redis or similar
// if you deploy across multiple serverless instances that don't share memory.
const lastRequestAt = new Map<string, number>();

export function isRateLimited(userId: string, minMs: number): boolean {
  const now = Date.now();
  const last = lastRequestAt.get(userId);
  if (last && now - last < minMs) {
    return true;
  }
  lastRequestAt.set(userId, now);
  return false;
}
