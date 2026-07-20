import { describe, expect, it, vi } from 'vitest'
import { createLogger } from '../structured-logger'

describe('createLogger', () => {
  it('emits structured JSON with required context fields', () => {
    const lines: string[] = []
    const logger = createLogger(
      { requestId: 'req-1', endpoint: '/api/recommend' },
      {
        minLevel: 'info',
        write: (line) => lines.push(line),
        now: () => new Date('2026-07-20T08:00:00.000Z'),
        captureError: () => 'evt',
      },
    )

    logger.info({
      sneakerApiSource: 'sneaker-db',
      totalLatencyMs: 120,
      retryCount: 0,
      circuitBreakerState: 'CLOSED',
    })

    expect(lines).toHaveLength(1)
    expect(JSON.parse(lines[0]!)).toMatchObject({
      requestId: 'req-1',
      endpoint: '/api/recommend',
      level: 'info',
      sneakerApiSource: 'sneaker-db',
    })
  })

  it('filters below min level and redacts secrets on error', () => {
    const lines: string[] = []
    const captureError = vi.fn(() => 'evt')
    const logger = createLogger(
      { requestId: 'req-2', endpoint: '/api/health' },
      {
        minLevel: 'error',
        write: (line) => lines.push(line),
        captureError,
      },
    )

    logger.info({ message: 'hidden' })
    logger.error({ message: 'boom AIzaSyDummyKeyValue123456789012', errorCode: 'INTERNAL_ERROR' })

    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('[REDACTED]')
    expect(lines[0]).not.toContain('AIza')
    expect(captureError).toHaveBeenCalled()
  })
})
