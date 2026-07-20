import * as Sentry from '@sentry/node'
import { initSentryServer } from './sentryServerInit'

export type ServerErrorContext = {
  endpoint: string
  requestId: string
  errorType: string
}

/**
 * Capture a serverless error with structured tags/extra. Never throws.
 */
export function captureServerError(
  error: unknown,
  context: ServerErrorContext,
): string | undefined {
  try {
    initSentryServer()

    return Sentry.withScope((scope) => {
      scope.setTag('endpoint', context.endpoint)
      scope.setTag('errorType', context.errorType)
      scope.setExtra('requestId', context.requestId)
      return Sentry.captureException(error)
    })
  } catch (captureFailure) {
    console.warn('[sentry] captureServerError failed', captureFailure)
    return undefined
  }
}
