/** Gemini daily quota snapshot for UI banners and health checks. */
export type QuotaStatus = {
  /** Remaining requests in the current window. */
  remaining: number
  /** Configured daily limit. */
  limit: number
  /** True when remaining is zero (or below). */
  isExhausted: boolean
  /** ISO-8601 reset time, or null when unknown. */
  resetTime: string | null
}
