import { describe, expect, it, vi } from 'vitest'
import { CompressedRetryQueue } from '../../utils/retry-queue'
import { SneaksFallbackService } from '../sneaks-fallback-service'

describe('SneaksFallbackService', () => {
  it('maps community search results and filters by budget', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json([
        {
          styleID: 'fb-1',
          shoeName: 'Fallback Runner',
          brand: 'Nike',
          colorway: 'White',
          retailPrice: 90,
          thumbnail: 'https://example.com/fb.jpg',
        },
        {
          styleID: 'fb-2',
          shoeName: 'Too Expensive',
          brand: 'Gucci',
          retailPrice: 500,
        },
      ]),
    )

    const service = new SneaksFallbackService({
      fetchImpl,
      retryQueue: new CompressedRetryQueue({
        delaysMs: [],
        maxBudgetMs: 20,
        sleep: async () => undefined,
      }),
      logger: { info: () => undefined, error: () => undefined },
    })

    const results = await service.fetchSneakers({
      preferences: 'running nike',
      budget: { min: 50, max: 100 },
    })

    expect(results).toHaveLength(1)
    expect(results[0]?.id).toBe('fb-1')
    expect(results[0]?.aiExplanation).toBeNull()
  })
})
