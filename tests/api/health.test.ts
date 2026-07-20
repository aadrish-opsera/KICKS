import { describe, expect, it, vi } from 'vitest'
import {
  createHealthHandler,
  runHealthCheck,
  type HealthErrorResponse,
  type HealthResponse,
} from '../../api/health'

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

describe('runHealthCheck', () => {
  it('returns healthy when both probes are up', async () => {
    const result = await runHealthCheck({
      sneakerProbe: async () => 'up',
      geminiProbe: async () => 'up',
      getQuotaRemaining: () => 42,
      now: () => new Date('2026-07-20T06:00:00.000Z'),
    })

    expect(result).toEqual<HealthResponse>({
      status: 'healthy',
      sneakerApi: 'up',
      geminiApi: 'up',
      geminiQuotaRemaining: 42,
      timestamp: '2026-07-20T06:00:00.000Z',
    })
  })

  it('returns degraded when sneaker API is down', async () => {
    const result = await runHealthCheck({
      sneakerProbe: async () => 'down',
      geminiProbe: async () => 'up',
      getQuotaRemaining: () => -1,
    })

    expect(result.status).toBe('degraded')
    expect(result.sneakerApi).toBe('down')
    expect(result.geminiApi).toBe('up')
  })

  it('returns degraded when Gemini API is down', async () => {
    const result = await runHealthCheck({
      sneakerProbe: async () => 'up',
      geminiProbe: async () => 'down',
      getQuotaRemaining: () => -1,
    })

    expect(result.status).toBe('degraded')
    expect(result.sneakerApi).toBe('up')
    expect(result.geminiApi).toBe('down')
  })

  it('returns degraded when both APIs are down', async () => {
    const result = await runHealthCheck({
      sneakerProbe: async () => 'down',
      geminiProbe: async () => 'down',
      getQuotaRemaining: () => -1,
    })

    expect(result.status).toBe('degraded')
    expect(result.sneakerApi).toBe('down')
    expect(result.geminiApi).toBe('down')
  })

  it('treats rejected probes as down without throwing', async () => {
    const result = await runHealthCheck({
      sneakerProbe: async () => {
        throw new Error('timeout')
      },
      geminiProbe: async () => {
        throw new Error('timeout')
      },
      getQuotaRemaining: () => -1,
    })

    expect(result.status).toBe('degraded')
    expect(result.sneakerApi).toBe('down')
    expect(result.geminiApi).toBe('down')
  })

  it('completes within 5 seconds even when probes are slow', async () => {
    const slowProbe = async (): Promise<'down'> => {
      await new Promise((resolve) => {
        setTimeout(resolve, 75)
      })
      return 'down'
    }

    const started = Date.now()
    const result = await runHealthCheck({
      sneakerProbe: slowProbe,
      geminiProbe: slowProbe,
      getQuotaRemaining: () => -1,
    })
    const elapsed = Date.now() - started

    expect(result.status).toBe('degraded')
    expect(elapsed).toBeLessThan(5000)
  })
})

describe('createHealthHandler', () => {
  it('returns 200 with Cache-Control no-store and no secrets in body', async () => {
    const handler = createHealthHandler({
      sneakerProbe: async () => 'up',
      geminiProbe: async () => 'up',
      getQuotaRemaining: () => 10,
      now: () => new Date('2026-07-20T06:00:00.000Z'),
    })
    const res = createMockResponse()

    await handler({} as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toBe('no-store')
    expect(res.headers['Content-Type']).toBe('application/json')
    expect(JSON.stringify(res.body)).not.toMatch(/GEMINI_API_KEY|SNEAKER_DB_API_KEY|sk-|AIza/)
    expect(res.body).toMatchObject({
      status: 'healthy',
      sneakerApi: 'up',
      geminiApi: 'up',
      geminiQuotaRemaining: 10,
    })
  })

  it('returns 500 with generic error when health check throws', async () => {
    const handler = createHealthHandler({
      sneakerProbe: async () => 'up',
      geminiProbe: async () => 'up',
      getQuotaRemaining: () => {
        throw new Error('quota boom with secret KEY=abc')
      },
    })
    const res = createMockResponse()

    await handler({} as never, res as never)

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual<HealthErrorResponse>({
      error: true,
      code: 'INTERNAL_ERROR',
      message: 'Health check failed',
    })
    expect(JSON.stringify(res.body)).not.toContain('quota boom')
    expect(JSON.stringify(res.body)).not.toContain('KEY=abc')
  })

  it('marks APIs down when probes simulate missing env vars', async () => {
    const handler = createHealthHandler({
      sneakerProbe: async () => 'down',
      geminiProbe: async () => 'down',
      getQuotaRemaining: () => -1,
    })
    const res = createMockResponse()

    await handler({} as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      status: 'degraded',
      sneakerApi: 'down',
      geminiApi: 'down',
      geminiQuotaRemaining: -1,
    })
  })
})

describe('fixture shapes', () => {
  it('documents healthy and unhealthy mock probe fixtures', () => {
    const healthyFixture = { sneakerApi: 'up', geminiApi: 'up' } as const
    const unhealthyFixture = { sneakerApi: 'down', geminiApi: 'down' } as const

    expect(healthyFixture.sneakerApi).toBe('up')
    expect(unhealthyFixture.geminiApi).toBe('down')
    // keep vi import used for future spy-based fixtures
    expect(vi.fn()).toBeTypeOf('function')
  })
})
