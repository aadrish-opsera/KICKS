export type QuotaTrackerConfig = {
  dailyLimit: number
  now: () => Date
}

/**
 * In-memory Gemini daily quota tracker.
 * Resets when the UTC calendar day changes (no timers).
 */
export class QuotaTracker {
  private count = 0
  private lastResetDay = ''
  private readonly config: QuotaTrackerConfig

  constructor(config: Partial<QuotaTrackerConfig> = {}) {
    this.config = {
      dailyLimit: 250,
      now: () => new Date(),
      ...config,
    }
    this.lastResetDay = utcDayKey(this.config.now())
  }

  check(): boolean {
    this.maybeReset()
    return this.remaining() > 0
  }

  remaining(): number {
    this.maybeReset()
    return Math.max(0, this.config.dailyLimit - this.count)
  }

  increment(by = 1): number {
    this.maybeReset()
    this.count += by
    return this.remaining()
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
