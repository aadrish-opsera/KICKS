export type RateLimiterConfig = {
  capacity: number
  refillIntervalMs: number
  dailyLimit: number
  now: () => number
  onEvent?: (event: {
    type: 'acquired' | 'throttled' | 'daily_exhausted'
    delayMs?: number
    tokens?: number
    dailyUsed?: number
  }) => void
}

export type RateLimitAcquireResult =
  | { ok: true; delayMs: 0 }
  | { ok: false; delayMs: number; reason: 'throttled' }
  | { ok: false; delayMs: 0; reason: 'daily_exhausted'; useFallback: true }

export type RateLimiterStatus = {
  tokens: number
  dailyUsed: number
  dailyRemaining: number
}

/**
 * Token-bucket rate limiter (5 req/s) plus UTC daily budget (500).
 * Cold start resets both counters — accepted serverless limitation.
 */
export class RateLimiter {
  private tokens: number
  private lastRefillAt: number
  private dailyUsed = 0
  private lastResetDay = ''
  private readonly config: RateLimiterConfig

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      capacity: 5,
      refillIntervalMs: 200,
      dailyLimit: 500,
      now: () => Date.now(),
      ...config,
    }
    this.tokens = this.config.capacity
    this.lastRefillAt = this.config.now()
    this.lastResetDay = utcDayKey(this.config.now())
  }

  /** Blocking acquire used by existing callers. */
  async acquire(): Promise<void> {
    for (;;) {
      const result = this.acquireToken()
      if (result.ok) {
        return
      }
      if (result.reason === 'daily_exhausted') {
        throw new Error('Daily sneaker API budget exhausted')
      }
      await sleep(result.delayMs)
    }
  }

  acquireToken(): RateLimitAcquireResult {
    this.maybeResetDaily()
    this.refill()

    if (this.dailyUsed >= this.config.dailyLimit) {
      this.config.onEvent?.({
        type: 'daily_exhausted',
        dailyUsed: this.dailyUsed,
      })
      return { ok: false, delayMs: 0, reason: 'daily_exhausted', useFallback: true }
    }

    if (this.tokens < 1) {
      const delayMs = this.config.refillIntervalMs
      this.config.onEvent?.({ type: 'throttled', delayMs, tokens: this.tokens })
      return { ok: false, delayMs, reason: 'throttled' }
    }

    this.tokens -= 1
    this.dailyUsed += 1
    this.config.onEvent?.({
      type: 'acquired',
      tokens: this.tokens,
      dailyUsed: this.dailyUsed,
    })
    return { ok: true, delayMs: 0 }
  }

  getStatus(): RateLimiterStatus {
    this.maybeResetDaily()
    this.refill()
    return {
      tokens: this.tokens,
      dailyUsed: this.dailyUsed,
      dailyRemaining: Math.max(0, this.config.dailyLimit - this.dailyUsed),
    }
  }

  private refill(): void {
    const now = this.config.now()
    const elapsed = now - this.lastRefillAt
    if (elapsed < this.config.refillIntervalMs) {
      return
    }

    const tokensToAdd = Math.floor(elapsed / this.config.refillIntervalMs)
    if (tokensToAdd <= 0) {
      return
    }

    this.tokens = Math.min(this.config.capacity, this.tokens + tokensToAdd)
    this.lastRefillAt += tokensToAdd * this.config.refillIntervalMs
  }

  private maybeResetDaily(): void {
    const day = utcDayKey(this.config.now())
    if (day !== this.lastResetDay) {
      this.dailyUsed = 0
      this.lastResetDay = day
    }
  }
}

function utcDayKey(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
