export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = Record<string, unknown>

export interface ILogger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  child(context: LogContext): ILogger
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MAX_CONTEXT_VALUE_LENGTH = 1000

export type StructuredLoggerOptions = {
  level?: LogLevel
  context?: LogContext
  writeStdout?: (line: string) => void
  writeStderr?: (line: string) => void
  now?: () => Date
}

function parseLogLevel(raw: string | undefined): LogLevel {
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw
  }
  return 'info'
}

/**
 * Lightweight structured JSON logger for backend observability.
 * Never throws — stringify failures are swallowed.
 */
export class StructuredLogger implements ILogger {
  private readonly level: LogLevel
  private readonly context: LogContext
  private readonly writeStdout: (line: string) => void
  private readonly writeStderr: (line: string) => void
  private readonly now: () => Date

  constructor(options: StructuredLoggerOptions = {}) {
    this.level = options.level ?? parseLogLevel(process.env.LOG_LEVEL)
    this.context = { ...(options.context ?? {}) }
    this.writeStdout = options.writeStdout ?? ((line) => console.log(line))
    this.writeStderr = options.writeStderr ?? ((line) => console.error(line))
    this.now = options.now ?? (() => new Date())
  }

  debug(message: string, context?: LogContext): void {
    this.emit('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.emit('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.emit('warn', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.emit('error', message, context)
  }

  child(context: LogContext): ILogger {
    return new StructuredLogger({
      level: this.level,
      context: { ...this.context, ...context },
      writeStdout: this.writeStdout,
      writeStderr: this.writeStderr,
      now: this.now,
    })
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[this.level]
  }

  private emit(level: LogLevel, message: string, context?: LogContext): void {
    try {
      if (!this.shouldLog(level)) {
        return
      }

      const entry = {
        timestamp: this.now().toISOString(),
        level,
        message,
        context: this.sanitizeContext({
          ...this.context,
          ...(context ? this.sanitizeContext(context) : {}),
        }),
      }

      const line = this.safeStringify(entry)
      if (line === null) {
        return
      }

      if (level === 'error' || level === 'warn') {
        this.writeStderr(line)
      } else {
        this.writeStdout(line)
      }
    } catch {
      // Never throw from logging.
    }
  }

  private sanitizeContext(context: LogContext): LogContext {
    const seen = new WeakSet<object>()

    const visit = (value: unknown): unknown => {
      if (typeof value === 'string') {
        return value.length > MAX_CONTEXT_VALUE_LENGTH
          ? `${value.slice(0, MAX_CONTEXT_VALUE_LENGTH)}…[truncated]`
          : value
      }

      if (value === null || typeof value !== 'object') {
        return value
      }

      if (seen.has(value as object)) {
        return '[Circular]'
      }
      seen.add(value as object)

      if (Array.isArray(value)) {
        return value.map((item) => visit(item))
      }

      const result: Record<string, unknown> = {}
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        result[key] = visit(nested)
      }
      return result
    }

    return visit(context) as LogContext
  }

  private safeStringify(value: unknown): string | null {
    try {
      return JSON.stringify(value)
    } catch {
      return null
    }
  }
}

export const logger = new StructuredLogger()
