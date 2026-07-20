import { describe, expect, it, vi } from 'vitest'
import { createRecommendHandler } from '../recommend'
import {
  invalidRecommendRequest,
  mockCandidates,
  validRecommendRequest,
} from './fixtures/recommend-scenarios'
import { QuotaExhaustedError } from '../../src/services/gemini-service'
import { CircuitBreakerOpenError } from '../../src/utils/circuit-breaker'

type MockResponse = {
  statusCode: number
  body: unknown
  headers: Record<string, string>
  status: (code: number) => MockResponse
  json: (payload: unknown) => MockResponse
  setHeader: (key: string, value: string) => void
}

function createMockResponse(): MockResponse {
  const response: MockResponse = {
    statusCode: 0,
    body: undefined,
    headers: {},
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value
    },
  }
  return response
}

describe('POST /api/recommend', () => {
  it('returns 405 for non-POST methods', async () => {
    const handler = createRecommendHandler({
      logger: { info: () => undefined, error: () => undefined },
    })
    const res = createMockResponse()
    await handler({ method: 'GET', body: {} } as never, res as never)
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 for invalid input', async () => {
    const handler = createRecommendHandler({
      logger: { info: () => undefined, error: () => undefined },
    })
    const res = createMockResponse()
    await handler(
      { method: 'POST', body: invalidRecommendRequest } as never,
      res as never,
    )
    expect(res.statusCode).toBe(400)
    expect(res.body).toMatchObject({ error: true, code: 'INVALID_INPUT' })
  })

  it('returns 200 for a valid primary path', async () => {
    const handler = createRecommendHandler({
      sneakerService: {
        fetchSneakers: vi.fn(async () => mockCandidates),
      },
      geminiService: {
        rankSneakers: vi.fn(async () => ({
          sneakers: mockCandidates.map((sneaker, index) => ({
            ...sneaker,
            aiExplanation: `Reason ${index + 1}`,
            aiRating: 8,
          })),
          aiRankingAvailable: true,
          tokensUsed: 100,
          quotaRemaining: 200,
        })),
      },
      logger: { info: () => undefined, error: () => undefined },
    })
    const res = createMockResponse()
    await handler(
      { method: 'POST', body: validRecommendRequest } as never,
      res as never,
    )
    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toBe('no-store')
    expect(res.body).toMatchObject({
      aiRankingAvailable: true,
      sneakerApiSource: 'sneaker-db',
    })
  })

  it('falls back to sneaks when primary circuit opens', async () => {
    const handler = createRecommendHandler({
      sneakerService: {
        fetchSneakers: vi.fn(async () => {
          throw new CircuitBreakerOpenError()
        }),
      },
      sneaksFallbackService: {
        fetchSneakers: vi.fn(async () => mockCandidates),
      },
      geminiService: {
        rankSneakers: vi.fn(async () => ({
          sneakers: mockCandidates,
          aiRankingAvailable: true,
          tokensUsed: 10,
          quotaRemaining: 100,
        })),
      },
      logger: { info: () => undefined, error: () => undefined },
    })
    const res = createMockResponse()
    await handler(
      { method: 'POST', body: validRecommendRequest } as never,
      res as never,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ sneakerApiSource: 'sneaks-api' })
  })

  it('returns 503 when both sneaker sources fail', async () => {
    const handler = createRecommendHandler({
      sneakerService: {
        fetchSneakers: vi.fn(async () => {
          throw new Error('primary down')
        }),
      },
      sneaksFallbackService: {
        fetchSneakers: vi.fn(async () => {
          throw new Error('fallback down')
        }),
      },
      logger: { info: () => undefined, error: () => undefined },
    })
    const res = createMockResponse()
    await handler(
      { method: 'POST', body: validRecommendRequest } as never,
      res as never,
    )
    expect(res.statusCode).toBe(503)
  })

  it('returns degraded 200 when Gemini quota is exhausted', async () => {
    const handler = createRecommendHandler({
      sneakerService: {
        fetchSneakers: vi.fn(async () => mockCandidates),
      },
      geminiService: {
        rankSneakers: vi.fn(async () => {
          throw new QuotaExhaustedError()
        }),
      },
      logger: { info: () => undefined, error: () => undefined },
    })
    const res = createMockResponse()
    await handler(
      { method: 'POST', body: validRecommendRequest } as never,
      res as never,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ aiRankingAvailable: false })
  })

  it('returns 504 when timeout guard trips', async () => {
    let now = 0
    const handler = createRecommendHandler({
      now: () => now,
      hardTimeoutMs: 9_000,
      sneakerService: {
        fetchSneakers: vi.fn(async () => {
          now = 9_500
          return mockCandidates
        }),
      },
      logger: { info: () => undefined, error: () => undefined },
    })
    const res = createMockResponse()
    await handler(
      { method: 'POST', body: validRecommendRequest } as never,
      res as never,
    )
    expect(res.statusCode).toBe(504)
  })
})
