export type RateLimiterConfig = {
  capacity: number
  refillIntervalMs: number
  now: () => number
}

/**
 * Token-bucket rate limiter (default: 5 req/s via 1 token every 200ms).
 */
export class RateLimiter {
  private tokens: number
  private lastRefillAt: number
  private readonly config: RateLimiterConfig

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      capacity: 5,
      refillIntervalMs: 200,
      now: () => Date.now(),
      ...config,
    }
    this.tokens = this.config.capacity
    this.lastRefillAt = this.config.now()
  }

  async acquire(): Promise<void> {
    for (;;) {
      this.refill()
      if (this.tokens >= 1) {
        this.tokens -= 1
        return
      }

      const waitMs = this.config.refillIntervalMs
      await sleep(waitMs)
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
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
