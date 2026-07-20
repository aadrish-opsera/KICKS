/**
 * Sliding-window rate limiter for Edge Middleware (Web APIs only).
 * In-memory Map resets on cold start — best-effort on Vercel Hobby.
 */

export const RATE_LIMIT = 100
export const WINDOW_MS = 60_000

type Bucket = {
  timestamps: number[]
}

const buckets = new Map<string, Bucket>()
let lastCleanupAt = 0

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) {
      return first
    }
  }
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

export function cleanupExpired(now = Date.now()): void {
  for (const [ip, bucket] of buckets.entries()) {
    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < WINDOW_MS)
    if (bucket.timestamps.length === 0) {
      buckets.delete(ip)
    }
  }
  lastCleanupAt = now
}

export function maybeCleanup(now = Date.now()): void {
  if (now - lastCleanupAt >= WINDOW_MS) {
    cleanupExpired(now)
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number }

export function checkRateLimit(ip: string, now = Date.now()): RateLimitResult {
  maybeCleanup(now)
  const bucket = buckets.get(ip) ?? { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < WINDOW_MS)

  if (bucket.timestamps.length >= RATE_LIMIT) {
    const oldest = bucket.timestamps[0] ?? now
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000))
    buckets.set(ip, bucket)
    return { allowed: false, retryAfter }
  }

  bucket.timestamps.push(now)
  buckets.set(ip, bucket)
  return { allowed: true }
}

/** Test-only helper to reset in-memory state between cases. */
export function resetRateLimitState(): void {
  buckets.clear()
  lastCleanupAt = 0
}
