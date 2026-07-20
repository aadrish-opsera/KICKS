import type { QuotaStatus } from '../shared/types/quota'

export type QuotaTrackerConfig = {
  dailyLimit: number
  warningThresholdRatio: number
  now: () => Date
}

export type ExtendedQuotaStatus = QuotaStatus & {
  used: number
  nearExhaustion: boolean
  resetAtUtc: string
}

/**
 * In-memory Gemini daily quota tracker.
 * Resets when the UTC calendar day changes (no timers).
 * Cold start resets counters — accepted limitation on serverless.
 */
export class QuotaTracker {
  private count = 0
  private lastResetDay = ''
  private readonly config: QuotaTrackerConfig

  constructor(config: Partial<QuotaTrackerConfig> = {}) {
    this.config = {
      dailyLimit: 250,
      warningThresholdRatio: 0.8,
      now: () => new Date(),
      ...config,
    }
    this.lastResetDay = utcDayKey(this.config.now())
  }

  /** @deprecated Prefer canMakeRequest() */
  check(): boolean {
    return this.canMakeRequest()
  }

  canMakeRequest(): boolean {
    this.maybeReset()
    return this.remaining() > 0
  }

  remaining(): number {
    this.maybeReset()
    return Math.max(0, this.config.dailyLimit - this.count)
  }

  /** @deprecated Prefer recordRequest() */
  increment(by = 1): number {
    return this.recordRequest(by)
  }

  recordRequest(by = 1): number {
    this.maybeReset()
    this.count += by
    return this.count
  }

  getStatus(): ExtendedQuotaStatus {
    this.maybeReset()
    const remaining = this.remaining()
    const used = this.count
    const limit = this.config.dailyLimit
    return {
      used,
      remaining,
      limit,
      isExhausted: remaining <= 0,
      nearExhaustion: used / limit >= this.config.warningThresholdRatio,
      resetTime: nextUtcMidnight(this.config.now()).toISOString(),
      resetAtUtc: nextUtcMidnight(this.config.now()).toISOString(),
    }
  }

  reset(): void {
    this.count = 0
    this.lastResetDay = utcDayKey(this.config.now())
  }

  private maybeReset(): void {
    const today = utcDayKey(this.config.now())
    if (today !== this.lastResetDay) {
      this.count = 0
      this.lastResetDay = today
    }
  }
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function nextUtcMidnight(date: Date): Date {
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  )
  return next
}
