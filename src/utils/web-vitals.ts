/**
 * Report Core Web Vitals to the browser console in development.
 * Safe no-op in production builds (still registers, but only logs when DEV).
 */
export function initWebVitalsReporting(): void {
  if (typeof window === 'undefined') {
    return
  }

  const logMetric = (metric: { name: string; value: number; id: string }): void => {
    if (import.meta.env.DEV) {
      console.info(`[web-vitals] ${metric.name}=${Math.round(metric.value)} id=${metric.id}`)
    }
  }

  void import('web-vitals')
    .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(logMetric)
      onINP(logMetric)
      onLCP(logMetric)
      onFCP(logMetric)
      onTTFB(logMetric)
    })
    .catch(() => {
      // Optional dependency load failure must not break the app.
    })
}
