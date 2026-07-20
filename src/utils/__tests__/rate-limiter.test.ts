import { describe, expect, it } from 'vitest'
import { RateLimiter } from '../rate-limiter'

describe('RateLimiter', () => {
  it('acquires tokens within capacity', () => {
    const limiter = new RateLimiter({ capacity: 2, refillIntervalMs: 1000, dailyLimit: 10 })
    expect(limiter.acquireToken().ok).toBe(true)
    expect(limiter.acquireToken().ok).toBe(true)
    const throttled = limiter.acquireToken()
    expect(throttled.ok).toBe(false)
    if (!throttled.ok) {
      expect(throttled.reason).toBe('throttled')
      expect(throttled.delayMs).toBeGreaterThan(0)
    }
  })

  it('signals fallback when daily budget is exhausted', () => {
    const limiter = new RateLimiter({
      capacity: 5,
      dailyLimit: 1,
      refillIntervalMs: 1,
    })
    expect(limiter.acquireToken().ok).toBe(true)
    const exhausted = limiter.acquireToken()
    expect(exhausted).toMatchObject({
      ok: false,
      reason: 'daily_exhausted',
      useFallback: true,
    })
  })

  it('exposes status counters', () => {
    const limiter = new RateLimiter({ dailyLimit: 500 })
    limiter.acquireToken()
    expect(limiter.getStatus()).toMatchObject({
      dailyUsed: 1,
      dailyRemaining: 499,
    })
  })
})
