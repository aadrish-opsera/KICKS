import { describe, expect, it, vi } from 'vitest'
import {
  CompressedRetryQueue,
  RetryExhaustedError,
  isTransientError,
} from '../../../src/utils/retry-queue'

describe('CompressedRetryQueue (WO-146)', () => {
  it('uses default exponential backoff intervals 200/400/800/1600', async () => {
    const delays: number[] = []
    const queue = new CompressedRetryQueue({
      sleep: async (ms) => {
        delays.push(ms)
      },
      maxBudgetMs: 10_000,
    })

    let calls = 0
    await queue.run(async () => {
      calls += 1
      if (calls < 5) {
        throw Object.assign(new Error('busy'), { status: 503, retryable: true })
      }
      return 'ok'
    }, isTransientError)

    expect(delays).toEqual([200, 400, 800, 1600])
  })

  it('stops retrying when remaining timeout budget is too small', async () => {
    const onRetry = vi.fn()
    const queue = new CompressedRetryQueue({
      delaysMs: [200],
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
