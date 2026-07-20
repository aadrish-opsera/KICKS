import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  degradedResponse,
  error400Response,
  error503Response,
  error504Response,
  successResponse,
} from '../test-fixtures/apiResponseFixtures'
import { DEFAULT_BUDGET } from '../types/budget'
import { postRecommendation, RecommendationApiError } from './recommendationApi'

describe('postRecommendation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('posts JSON and returns success payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => successResponse,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await postRecommendation({
      preferences: 'blue runners',
      budget: DEFAULT_BUDGET,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recommend',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(result).toEqual(successResponse)
  })

  it('returns degraded payloads without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => degradedResponse,
      }),
    )
    await expect(
      postRecommendation({ preferences: 'blue runners', budget: DEFAULT_BUDGET }),
    ).resolves.toEqual(degradedResponse)
  })

  it('maps HTTP errors to RecommendationApiError', async () => {
    for (const [status, body] of [
      [400, error400Response],
      [503, error503Response],
      [504, error504Response],
    ] as const) {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status,
          json: async () => body,
        }),
      )
      await expect(
        postRecommendation({ preferences: 'x', budget: DEFAULT_BUDGET }),
      ).rejects.toMatchObject({
        name: 'RecommendationApiError',
        code: body.code,
        status,
      })
    }
  })

  it('maps network failures to NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(
      postRecommendation({ preferences: 'blue runners', budget: DEFAULT_BUDGET }),
    ).rejects.toBeInstanceOf(RecommendationApiError)
    await expect(
      postRecommendation({ preferences: 'blue runners', budget: DEFAULT_BUDGET }),
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
})
