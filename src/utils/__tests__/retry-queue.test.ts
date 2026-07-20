import { describe, expect, it, vi } from 'vitest'
import {
  CompressedRetryQueue,
  RetryExhaustedError,
  isTransientError,
} from '../retry-queue'

describe('CompressedRetryQueue', () => {
  it('retries transient failures with backoff then succeeds', async () => {
    const delays: number[] = []
    const queue = new CompressedRetryQueue({
      delaysMs: [5, 5],
      maxBudgetMs: 100,
      sleep: async (ms) => {
        delays.push(ms)
      },
    })

    let calls = 0
    const result = await queue.run(
      async () => {
        calls += 1
        if (calls < 3) {
          throw Object.assign(new Error('busy'), { status: 503, retryable: true })
        }
        return 'ok'
      },
      isTransientError,
    )

    expect(result.value).toBe('ok')
    expect(result.retryCount).toBe(2)
    expect(delays).toEqual([5, 5])
  })

  it('does not retry non-transient 4xx errors', async () => {
    const queue = new CompressedRetryQueue({
      delaysMs: [5],
      maxBudgetMs: 50,
      sleep: async () => undefined,
    })

    await expect(
      queue.run(
        async () => {
          throw Object.assign(new Error('bad'), { status: 400 })
        },
        isTransientError,
      ),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('throws RetryExhaustedError when budget is exhausted', async () => {
    const queue = new CompressedRetryQueue({
      delaysMs: [20, 20],
      maxBudgetMs: 15,
      sleep: async () => undefined,
      now: (() => {
        let t = 0
        return () => {
          t += 10
          return t
        }
      })(),
    })

    await expect(
      queue.run(
        async () => {
          throw Object.assign(new Error('down'), { retryable: true })
        },
        isTransientError,
      ),
    ).rejects.toBeInstanceOf(RetryExhaustedError)
  })

  it('aborts retry when remainingTimeoutMs is insufficient', async () => {
    const onRetry = vi.fn()
    const queue = new CompressedRetryQueue({
      delaysMs: [50],
      maxBudgetMs: 1000,
      sleep: async () => undefined,
      onRetry,
    })

    await expect(
      queue.run(
        async () => {
          throw Object.assign(new Error('down'), { retryable: true })
        },
        isTransientError,
        { remainingTimeoutMs: 10 },
      ),
    ).rejects.toBeInstanceOf(RetryExhaustedError)
    expect(onRetry).not.toHaveBeenCalled()
  })
})
