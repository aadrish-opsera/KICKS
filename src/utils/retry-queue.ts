export type RetryQueueConfig = {
  delaysMs: readonly number[]
  maxBudgetMs: number
  sleep: (ms: number) => Promise<void>
  now: () => number
  onRetry?: (event: {
    attempt: number
    delayMs: number
    error: unknown
  }) => void
}

const DEFAULT_DELAYS = [200, 400, 800, 1600] as const

export type RetryContext = {
  attempt: number
  elapsedMs: number
}

export class RetryExhaustedError extends Error {
  readonly code = 'RETRY_EXHAUSTED' as const
  readonly retryCount: number
  readonly lastError: unknown

  constructor(retryCount: number, lastError: unknown) {
    super('Retry budget exhausted')
    this.name = 'RetryExhaustedError'
    this.retryCount = retryCount
    this.lastError = lastError
  }
}

/**
 * Compressed retry queue with exponential backoff and a hard time budget.
 * Cold starts are fine — this utility is stateless per invocation.
 */
export class CompressedRetryQueue {
  private readonly config: RetryQueueConfig

  constructor(config: Partial<RetryQueueConfig> = {}) {
    this.config = {
      delaysMs: DEFAULT_DELAYS,
      maxBudgetMs: 3000,
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      now: () => Date.now(),
      ...config,
    }
  }

  async run<T>(
    operation: (ctx: RetryContext) => Promise<T>,
    shouldRetry: (error: unknown) => boolean,
    options: { remainingTimeoutMs?: number } = {},
  ): Promise<{ value: T; retryCount: number }> {
    const startedAt = this.config.now()
    let attempt = 0
    let lastError: unknown

    while (attempt <= this.config.delaysMs.length) {
      const elapsedMs = this.config.now() - startedAt
      if (elapsedMs >= this.config.maxBudgetMs && attempt > 0) {
        break
      }

      try {
        const value = await operation({ attempt, elapsedMs })
        return { value, retryCount: attempt }
      } catch (error) {
        lastError = error
        if (!shouldRetry(error) || attempt >= this.config.delaysMs.length) {
          throw error
        }

        const delay = this.config.delaysMs[attempt] ?? 0
        const budgetRemaining =
          this.config.maxBudgetMs - (this.config.now() - startedAt)
        const hardRemaining = options.remainingTimeoutMs
        if (budgetRemaining <= 0) {
          break
        }
        if (hardRemaining !== undefined && hardRemaining < delay) {
          break
        }

        this.config.onRetry?.({ attempt: attempt + 1, delayMs: delay, error })
        await this.config.sleep(Math.min(delay, budgetRemaining))
        attempt += 1
      }
    }

    throw new RetryExhaustedError(attempt, lastError)
  }
}

/** Default transient HTTP/network retry predicate. */
export function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }
  const status = (error as { status?: number }).status
  if (typeof status === 'number') {
    return status === 429 || status >= 500
  }
  const retryable = (error as { retryable?: boolean }).retryable
  return retryable === true
}
