import type { ErrorEvent } from '@sentry/core'

const SENSITIVE_HEADER_PATTERN = /^(authorization|x-api-key|.*key.*)$/i
const API_KEY_VALUE_PATTERN = /(AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z]{10,}|Bearer\s+\S+)/i

function scrubString(value: string): string {
  return value.replace(API_KEY_VALUE_PATTERN, '[REDACTED]')
}

function scrubUnknown(value: unknown): unknown {
  if (typeof value === 'string') {
    return scrubString(value)
  }

  if (Array.isArray(value)) {
    return value.map(scrubUnknown)
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_HEADER_PATTERN.test(key) || /password|secret|token|pii/i.test(key)) {
        result[key] = '[REDACTED]'
        continue
      }
      result[key] = scrubUnknown(nested)
    }
    return result
  }

  return value
}

/**
 * Shared beforeSend sanitizer for client and server Sentry init.
 * Strips auth headers, request bodies (may contain user prefs), and API-key-like values.
 */
export function sanitizeSentryEvent(event: ErrorEvent): ErrorEvent | null {
  const sanitized: ErrorEvent = { ...event }

  if (sanitized.request) {
    const headers = sanitized.request.headers
      ? Object.fromEntries(
          Object.entries(sanitized.request.headers).filter(
            ([key]) => !SENSITIVE_HEADER_PATTERN.test(key),
          ),
        )
      : undefined

    sanitized.request = {
      ...sanitized.request,
      headers,
      data: undefined,
      query_string: undefined,
      cookies: undefined,
    }
  }

  if (sanitized.extra) {
    sanitized.extra = scrubUnknown(sanitized.extra) as ErrorEvent['extra']
  }

  if (sanitized.contexts) {
    sanitized.contexts = scrubUnknown(sanitized.contexts) as ErrorEvent['contexts']
  }

  if (typeof sanitized.message === 'string') {
    sanitized.message = scrubString(sanitized.message)
  }

  return sanitized
}
