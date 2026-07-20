export type RetryQueueConfig = {
  delaysMs: readonly number[]
  maxBudgetMs: number
  sleep: (ms: number) => Promise<void>
  now: () => number
}

const DEFAULT_DELAYS = [200, 400, 800, 1600] as const

export type RetryContext = {
  attempt: number
  elapsedMs: number
}

/**
 * Compressed retry queue with exponential backoff and a hard time budget.
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
        const remaining = this.config.maxBudgetMs - (this.config.now() - startedAt)
        if (remaining <= 0) {
          break
        }

        await this.config.sleep(Math.min(delay, remaining))
        attempt += 1
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Retry budget exhausted')
  }
}
