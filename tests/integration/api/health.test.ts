import { describe, expect, it } from 'vitest'
import { createHealthHandler } from '../../../api/health'
import '../setup'

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

describe('Integration: GET /api/health (WO-147)', () => {
  it('healthy state returns 200 with ok status and quota remaining', async () => {
    const handler = createHealthHandler({
      sneakerProbe: async () => 'up',
      geminiProbe: async () => 'up',
      getQuotaRemaining: () => 200,
    })
    const res = createMockResponse()
    await handler({ method: 'GET' } as never, res as never)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Content-Type']).toBe('application/json')
    expect(res.body).toMatchObject({
      status: 'healthy',
      geminiQuotaRemaining: 200,
      sneakerApi: 'up',
      geminiApi: 'up',
    })
  })

  it('degraded connectivity returns 200 with degraded status', async () => {
    const handler = createHealthHandler({
      sneakerProbe: async () => 'down',
      geminiProbe: async () => 'down',
      getQuotaRemaining: () => 0,
    })
    const res = createMockResponse()
    await handler({ method: 'GET' } as never, res as never)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ status: 'degraded' })
  })
})
