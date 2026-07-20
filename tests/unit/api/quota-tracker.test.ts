import { describe, expect, it } from 'vitest'
import { QuotaTracker } from '../../../src/utils/quota-tracker'

describe('QuotaTracker (WO-146)', () => {
  it('starts at 250 remaining and supports pre-flight checks', () => {
    const tracker = new QuotaTracker({ dailyLimit: 250 })
    expect(tracker.remaining()).toBe(250)
    expect(tracker.check()).toBe(true)
    expect(tracker.canMakeRequest()).toBe(true)
  })

  it('exhausts accurately at the daily limit', () => {
    const tracker = new QuotaTracker({ dailyLimit: 250 })
    for (let i = 0; i < 250; i += 1) {
      tracker.increment()
    }
    expect(tracker.remaining()).toBe(0)
    expect(tracker.check()).toBe(false)
  })
})
