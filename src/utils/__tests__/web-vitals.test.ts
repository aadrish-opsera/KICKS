import { afterEach, describe, expect, it, vi } from 'vitest'

describe('initWebVitalsReporting', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('does not throw when window is undefined', async () => {
    vi.stubGlobal('window', undefined)
    const { initWebVitalsReporting } = await import('../web-vitals')
    expect(() => initWebVitalsReporting()).not.toThrow()
  })

  it('registers Core Web Vitals reporters when window is available', async () => {
    const onCLS = vi.fn()
    const onINP = vi.fn()
    const onLCP = vi.fn()
    const onFCP = vi.fn()
    const onTTFB = vi.fn()

    vi.doMock('web-vitals', () => ({
      onCLS,
      onINP,
      onLCP,
      onFCP,
      onTTFB,
    }))

    vi.stubGlobal('window', {})
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    const { initWebVitalsReporting } = await import('../web-vitals')
    initWebVitalsReporting()

    await vi.waitFor(() => {
      expect(onCLS).toHaveBeenCalled()
    })

    expect(onINP).toHaveBeenCalled()
    expect(onLCP).toHaveBeenCalled()
    expect(onFCP).toHaveBeenCalled()
    expect(onTTFB).toHaveBeenCalled()

    const logMetric = onLCP.mock.calls[0]?.[0] as (metric: {
      name: string
      value: number
      id: string
    }) => void
    logMetric({ name: 'LCP', value: 1234.5, id: 'v1' })
    expect(info).toHaveBeenCalledWith(expect.stringContaining('[web-vitals] LCP=1235'))

    info.mockRestore()
  })

  it('swallows web-vitals import failures without throwing', async () => {
    vi.doMock('web-vitals', () => {
      throw new Error('module unavailable')
    })
    vi.stubGlobal('window', {})

    const { initWebVitalsReporting } = await import('../web-vitals')
    expect(() => initWebVitalsReporting()).not.toThrow()
    // Allow the rejected dynamic import microtask to settle.
    await Promise.resolve()
    await Promise.resolve()
  })
})
