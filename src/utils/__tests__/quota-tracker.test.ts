import { describe, expect, it } from 'vitest'
import { QuotaTracker } from '../quota-tracker'

describe('QuotaTracker', () => {
  it('starts at the configured daily limit', () => {
    const tracker = new QuotaTracker({ dailyLimit: 250 })
    expect(tracker.remaining()).toBe(250)
    expect(tracker.check()).toBe(true)
  })

  it('decrements on increment and fails check at zero', () => {
    const tracker = new QuotaTracker({ dailyLimit: 2 })
    tracker.increment()
    expect(tracker.remaining()).toBe(1)
    tracker.increment()
    expect(tracker.remaining()).toBe(0)
    expect(tracker.check()).toBe(false)
  })

  it('resets at UTC midnight via date comparison', () => {
    let current = new Date('2026-07-20T23:59:00.000Z')
    const tracker = new QuotaTracker({
      dailyLimit: 5,
      now: () => current,
    })
    tracker.increment(5)
    expect(tracker.remaining()).toBe(0)

    current = new Date('2026-07-21T00:00:01.000Z')
    expect(tracker.remaining()).toBe(5)
    expect(tracker.check()).toBe(true)
  })

  it('exposes getStatus with nearExhaustion and resetAtUtc', () => {
    const tracker = new QuotaTracker({
      dailyLimit: 10,
      now: () => new Date('2026-07-20T12:00:00.000Z'),
    })
    tracker.recordRequest(8)
    const status = tracker.getStatus()
    expect(status).toMatchObject({
      used: 8,
      remaining: 2,
      limit: 10,
      nearExhaustion: true,
      isExhausted: false,
    })
    expect(status.resetAtUtc).toBe('2026-07-21T00:00:00.000Z')
  })

  it('canMakeRequest mirrors check()', () => {
    const tracker = new QuotaTracker({ dailyLimit: 1 })
    expect(tracker.canMakeRequest()).toBe(true)
    tracker.recordRequest()
    expect(tracker.canMakeRequest()).toBe(false)
  })
})
