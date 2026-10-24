/**
 * Rate limiting for public POST endpoints.
 *
 * In-memory fixed-window limiter — "rate-limit-ready architecture": zero
 * dependencies, protects a single node immediately. The `-limit` headers and
 * the `RateLimiter` interface make swapping in Upstash/Redis (multi-instance
 * production) a drop-in change without touching the route handlers.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  limit: (key: string) => Promise<RateLimitResult>;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Occasionally sweep expired buckets so the map cannot grow unbounded.
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitKey(request: Request, scope: string): string {
  return `${scope}:${clientIp(request)}`;
}

export async function rateLimit(
  request: Request,
  scope: string,
  max = MAX_REQUESTS,
  windowMs = WINDOW_MS,
): Promise<RateLimitResult> {
  sweep();
  const key = rateLimitKey(request, scope);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  bucket.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return {
    ok: bucket.count <= max,
    remaining: Math.max(0, max - bucket.count),
    retryAfterSeconds,
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(MAX_REQUESTS),
    "X-RateLimit-Remaining": String(result.remaining),
    "Retry-After": String(result.retryAfterSeconds),
  };
}
