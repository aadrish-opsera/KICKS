/**
 * WO-150: measure /api/recommend handler latency with fully mocked dependencies.
 *
 * Production NFR: p50 <= 4s, p95 <= 8s (includes network).
 * Mock-adjusted targets below remove external network so CI stays deterministic.
 * Documented caveat: production p50/p95 will be higher than these mock numbers.
 */
import { describe, expect, it, vi } from 'vitest'
import { createRecommendHandler } from '../../api/recommend'
import {
  mockCandidates,
  validRecommendRequest,
} from '../../api/__tests__/fixtures/recommend-scenarios'

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

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 0
  }
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  )
  return sorted[index]!
}

describe('performance: /api/recommend latency (mocked)', () => {
  it('reports p50/p95/p99 within mock-adjusted budgets across 50 requests', async () => {
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
          tokensUsed: 10,
          quotaRemaining: 200,
        })),
      },
      logger: { info: () => undefined, error: () => undefined },
    })

    const samples: number[] = []
    for (let i = 0; i < 50; i += 1) {
      const res = createMockResponse()
      const started = performance.now()
      await handler(
        { method: 'POST', body: validRecommendRequest } as never,
        res as never,
      )
      samples.push(performance.now() - started)
      expect(res.statusCode).toBe(200)
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const p50 = percentile(sorted, 50)
    const p95 = percentile(sorted, 95)
    const p99 = percentile(sorted, 99)

    // Intentional perf metric report for CI logs.
    console.info(
      JSON.stringify({
        metric: 'recommend_latency_ms',
        n: samples.length,
        p50: Math.round(p50),
        p95: Math.round(p95),
        p99: Math.round(p99),
        note: 'Mocked deps — production NFR remains p50<=4000 p95<=8000',
      }),
    )

    // Mock-adjusted (no network): keep generous headroom for CI runners.
    expect(p50).toBeLessThanOrEqual(500)
    expect(p95).toBeLessThanOrEqual(1000)
    // Production documentation targets (always true if mock targets hold).
    expect(p50).toBeLessThanOrEqual(4000)
    expect(p95).toBeLessThanOrEqual(8000)
  })
})
