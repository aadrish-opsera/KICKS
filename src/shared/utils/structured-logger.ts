import { captureServerError } from './captureServerError'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type StructuredLogFields = {
  timestamp: string
  level: LogLevel
  requestId: string
  endpoint: string
  sneakerApiSource?: string
  sneakerApiLatencyMs?: number
  sneakerApiStatus?: string
  geminiLatencyMs?: number
  geminiStatus?: string
  geminiTokensUsed?: number
  geminiQuotaRemaining?: number
  totalLatencyMs?: number
  retryCount?: number
  circuitBreakerState?: string
  message?: string
  errorCode?: string
}

export type LoggerConfig = {
  minLevel: LogLevel
  write: (line: string) => void
  now: () => Date
  captureError?: typeof captureServerError
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export type ScopedLogger = {
  debug: (fields: Partial<StructuredLogFields>) => void
  info: (fields: Partial<StructuredLogFields>) => void
  warn: (fields: Partial<StructuredLogFields>) => void
  error: (fields: Partial<StructuredLogFields> & { errorCode?: string }) => void
}

/**
 * Structured JSON logger for serverless functions.
 * Error events optionally forward sanitized context to Sentry.
 */
export function createLogger(
  context: { requestId: string; endpoint: string },
  config: Partial<LoggerConfig> = {},
): ScopedLogger {
  const resolved: LoggerConfig = {
    minLevel: (process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info',
    write: (line) => console.log(line),
    now: () => new Date(),
    captureError: captureServerError,
    ...config,
  }

  const emit = (level: LogLevel, fields: Partial<StructuredLogFields>): void => {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[resolved.minLevel]) {
      return
    }

    const entry: StructuredLogFields = {
      timestamp: resolved.now().toISOString(),
      level,
      requestId: context.requestId,
      endpoint: context.endpoint,
      ...fields,
    }

    // Never emit secrets or stack traces.
    const safe = JSON.parse(JSON.stringify(entry)) as StructuredLogFields
    if (typeof safe.message === 'string') {
      safe.message = safe.message.replace(
        /(AIza[0-9A-Za-z_-]+|sk-[0-9A-Za-z]+)/g,
        '[REDACTED]',
      )
    }

    resolved.write(JSON.stringify(safe))

    if (level === 'error' && resolved.captureError) {
      resolved.captureError(new Error(safe.message ?? 'serverless error'), {
        endpoint: context.endpoint,
        requestId: context.requestId,
        errorType: safe.errorCode ?? 'INTERNAL_ERROR',
      })
    }
  }

  return {
    debug: (fields) => emit('debug', fields),
    info: (fields) => emit('info', fields),
    warn: (fields) => emit('warn', fields),
    error: (fields) => emit('error', fields),
  }
}
