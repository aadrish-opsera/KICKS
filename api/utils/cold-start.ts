/**
 * Serverless cold-start detection for Vercel function handlers.
 * Module load time is captured at import; the first invocation is a cold start.
 * Must never throw — handlers wrap via getColdStartMetricsSafe.
 */

export type ColdStartMetrics = {
  isColdStart: boolean
  initDurationMs: number
}

type ColdStartTracker = {
  getColdStartMetrics: (handlerStartTime: number) => ColdStartMetrics
  resetForTests: (moduleLoadTime?: number) => void
}

export function createColdStartTracker(
  initialModuleLoadTime: number = Date.now(),
): ColdStartTracker {
  let moduleLoadTime = initialModuleLoadTime
  let hasServedInvocation = false

  return {
    getColdStartMetrics(handlerStartTime: number): ColdStartMetrics {
      const isColdStart = !hasServedInvocation
      hasServedInvocation = true
      return {
        isColdStart,
        initDurationMs: isColdStart
          ? Math.max(0, handlerStartTime - moduleLoadTime)
          : 0,
      }
    },
    resetForTests(nextModuleLoadTime: number = Date.now()): void {
      moduleLoadTime = nextModuleLoadTime
      hasServedInvocation = false
    },
  }
}

const defaultTracker = createColdStartTracker()

/**
 * Returns cold-start metrics. Never throws — on failure returns a warm no-op.
 */
export function getColdStartMetrics(handlerStartTime: number): ColdStartMetrics {
  try {
    return defaultTracker.getColdStartMetrics(handlerStartTime)
  } catch {
    console.warn(
      JSON.stringify({
        message: 'cold_start_metrics_failed',
        warning: 'Continuing without cold start metrics',
      }),
    )
    return { isColdStart: false, initDurationMs: 0 }
  }
}

/** Test-only: reset module-level cold-start state. */
export function __resetColdStartForTests(
  moduleLoadTime: number = Date.now(),
): void {
  defaultTracker.resetForTests(moduleLoadTime)
}
