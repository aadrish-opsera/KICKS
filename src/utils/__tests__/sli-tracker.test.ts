import { describe, expect, it, vi } from 'vitest'
import { SliTracker } from '../sli-tracker'

describe('SliTracker', () => {
  it('records metrics and computes summary', () => {
    const info = vi.fn()
    const tracker = new SliTracker({ logger: { info, warn: vi.fn() } })

    tracker.record({
      requestId: 'r1',
      sneakerApiLatencyMs: 100,
      sneakerApiSuccess: true,
      geminiLatencyMs: 200,
      geminiSuccess: true,
      totalLatencyMs: 350,
      geminiQuotaUsed: 1,
      degraded: false,
    })

    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({ messageType: 'sli_metric', requestId: 'r1' }),
    )
    expect(tracker.getSummary()).toMatchObject({
      totalRequests: 1,
      successfulRequests: 1,
      averageLatencyMs: 350,
      geminiQuotaUsed: 1,
    })
  })

  it('warns when success rate drops below 90%', () => {
    const warn = vi.fn()
    const tracker = new SliTracker({ logger: { info: vi.fn(), warn } })

    for (let i = 0; i < 5; i += 1) {
      tracker.record({
        requestId: `r${i}`,
        sneakerApiLatencyMs: 10,
        sneakerApiSuccess: false,
        geminiLatencyMs: 10,
        geminiSuccess: false,
        totalLatencyMs: 20,
        geminiQuotaUsed: 0,
        degraded: false,
      })
    }

    expect(warn).toHaveBeenCalled()
  })
})
