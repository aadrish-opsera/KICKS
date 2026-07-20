import * as Sentry from '@sentry/node'
import { sanitizeSentryEvent } from './sanitizeSentryEvent'

let initialized = false

/**
 * Initialize Node/serverless Sentry once. No-ops safely when SENTRY_DSN is missing.
 */
export function initSentryServer(): void {
  if (initialized) {
    return
  }

  try {
    const dsn = process.env.SENTRY_DSN

    if (!dsn || dsn.trim() === '') {
      console.warn('[sentry] SENTRY_DSN missing — server error tracking disabled')
      return
    }

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'production',
      sampleRate: 1.0,
      tracesSampleRate: 0,
      beforeSend(event) {
        return sanitizeSentryEvent(event)
      },
    })

    initialized = true
  } catch (error) {
    console.warn('[sentry] server init failed — continuing without Sentry', error)
  }
}
