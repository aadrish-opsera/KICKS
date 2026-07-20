import * as Sentry from '@sentry/react'
import { sanitizeSentryEvent } from './sanitizeSentryEvent'

/**
 * Initialize browser Sentry. No-ops safely when VITE_SENTRY_DSN is missing.
 */
export function initSentryClient(): void {
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN

    if (!dsn || typeof dsn !== 'string' || dsn.trim() === '') {
      console.warn('[sentry] VITE_SENTRY_DSN missing — client error tracking disabled')
      return
    }

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      sampleRate: 1.0,
      tracesSampleRate: 0,
      beforeSend(event) {
        return sanitizeSentryEvent(event)
      },
    })
  } catch (error) {
    console.warn('[sentry] client init failed — continuing without Sentry', error)
  }
}
