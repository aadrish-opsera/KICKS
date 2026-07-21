import { afterEach, describe, expect, it } from 'vitest'
import {
  __resetColdStartForTests,
  createColdStartTracker,
  getColdStartMetrics,
} from '../../../api/utils/cold-start'

describe('cold-start instrumentation (WO-151)', () => {
  afterEach(() => {
    __resetColdStartForTests()
  })

  it('detects the first invocation as a cold start', () => {
    const loadAt = 1_000_000
    const tracker = createColdStartTracker(loadAt)
    const metrics = tracker.getColdStartMetrics(loadAt + 42)
    expect(metrics.isColdStart).toBe(true)
    expect(metrics.initDurationMs).toBe(42)
  })

  it('detects subsequent invocations as warm', () => {
    const loadAt = 1_000_000
    const tracker = createColdStartTracker(loadAt)
    tracker.getColdStartMetrics(loadAt + 10)
    const warm = tracker.getColdStartMetrics(loadAt + 500)
    expect(warm.isColdStart).toBe(false)
    expect(warm.initDurationMs).toBe(0)
  })

  it('measures init duration within 10ms of the expected delta', () => {
    const loadAt = Date.now()
    const tracker = createColdStartTracker(loadAt)
    const handlerStart = loadAt + 25
    const { initDurationMs } = tracker.getColdStartMetrics(handlerStart)
    expect(Math.abs(initDurationMs - 25)).toBeLessThanOrEqual(10)
  })

  it('clamps negative deltas to zero', () => {
    const tracker = createColdStartTracker(5_000)
    const metrics = tracker.getColdStartMetrics(4_000)
    expect(metrics.initDurationMs).toBe(0)
    expect(metrics.isColdStart).toBe(true)
  })

  it('exports a module singleton that resets for tests', () => {
    __resetColdStartForTests(2_000)
    const first = getColdStartMetrics(2_050)
    expect(first.isColdStart).toBe(true)
    expect(first.initDurationMs).toBe(50)
    const second = getColdStartMetrics(2_100)
    expect(second.isColdStart).toBe(false)
  })
})
