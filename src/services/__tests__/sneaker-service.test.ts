import { describe, expect, it, vi } from 'vitest'
import {
  CircuitBreaker,
  CircuitBreakerOpenError,
} from '../../utils/circuit-breaker'
import { CompressedRetryQueue } from '../../utils/retry-queue'
import { RateLimiter } from '../../utils/rate-limiter'
import {
  sneakerDbMalformedResponse,
  sneakerDbSuccessResponse,
} from './fixtures/sneaker-db-responses'
import {
  SneakerApiError,
  SneakerService,
  mapSneakerDbResponse,
} from '../sneaker-service'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('mapSneakerDbResponse', () => {
  it('maps successful API payloads to SneakerResult[]', () => {
    const mapped = mapSneakerDbResponse(sneakerDbSuccessResponse)
    expect(mapped).toHaveLength(2)
    expect(mapped[0]).toMatchObject({
      id: 'snk-001',
      name: 'Air Zoom Pegasus',
      brand: 'Nike',
      retailPrice: 120,
      resalePrice: 135,
      aiExplanation: null,
    })
  })

  it('throws on malformed payloads', () => {
    expect(() => mapSneakerDbResponse(sneakerDbMalformedResponse)).toThrow(
      SneakerApiError,
    )
  })
})

describe('SneakerService', () => {
  it('fetches and maps sneakers on success', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(sneakerDbSuccessResponse))
    const logs: unknown[] = []
    const service = new SneakerService({
      apiKey: 'test-key',
      fetchImpl,
      logger: {
        info: (log) => logs.push(log),
        error: (log) => logs.push(log),
      },
      retryQueue: new CompressedRetryQueue({
        delaysMs: [1],
        maxBudgetMs: 50,
        sleep: async () => undefined,
      }),
    })

    const sneakers = await service.fetchSneakers({
      preferences: 'comfortable running nike',
      budget: { min: 50, max: 150 },
    })

    expect(sneakers).toHaveLength(2)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(logs[0]).toMatchObject({
      sneakerApiStatus: 'success',
      retryCount: 0,
    })
  })

  it('retries transient failures then succeeds', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'busy' }, 503))
      .mockResolvedValueOnce(jsonResponse(sneakerDbSuccessResponse))

    const service = new SneakerService({
      apiKey: 'test-key',
      fetchImpl,
      retryQueue: new CompressedRetryQueue({
        delaysMs: [1, 1],
        maxBudgetMs: 100,
        sleep: async () => undefined,
      }),
      logger: { info: () => undefined, error: () => undefined },
    })

    const sneakers = await service.fetchSneakers({
      preferences: 'running shoes',
      budget: { min: 0, max: 100 },
    })

    expect(sneakers).toHaveLength(2)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('trips circuit breaker after consecutive failures', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ message: 'down' }, 500))
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      openDurationMs: 60_000,
    })
    const service = new SneakerService({
      apiKey: 'test-key',
      fetchImpl,
      circuitBreaker: breaker,
      retryQueue: new CompressedRetryQueue({
        delaysMs: [],
        maxBudgetMs: 10,
        sleep: async () => undefined,
      }),
      logger: { info: () => undefined, error: () => undefined },
    })

    await expect(
      service.fetchSneakers({
        preferences: 'shoes',
        budget: { min: 0, max: 50 },
      }),
    ).rejects.toBeInstanceOf(SneakerApiError)

    await expect(
      service.fetchSneakers({
        preferences: 'shoes',
        budget: { min: 0, max: 50 },
      }),
    ).rejects.toBeInstanceOf(SneakerApiError)

    await expect(
      service.fetchSneakers({
        preferences: 'shoes',
        budget: { min: 0, max: 50 },
      }),
    ).rejects.toBeInstanceOf(CircuitBreakerOpenError)
  })

  it('surfaces timeout errors as retryable failures', async () => {
    const fetchImpl = vi.fn(async () => {
      const error = new Error('Aborted')
      error.name = 'AbortError'
      throw error
    })

    const service = new SneakerService({
      apiKey: 'test-key',
      fetchImpl,
      requestTimeoutMs: 5,
      retryQueue: new CompressedRetryQueue({
        delaysMs: [],
        maxBudgetMs: 10,
        sleep: async () => undefined,
      }),
      logger: { info: () => undefined, error: () => undefined },
    })

    await expect(
      service.fetchSneakers({
        preferences: 'shoes',
        budget: { min: 50, max: 100 },
      }),
    ).rejects.toMatchObject({ message: expect.stringMatching(/timed out/i) })
  })

  it('enforces rate limiting across consecutive calls', async () => {
    let now = 0
    const fetchImpl = vi.fn(async () => jsonResponse(sneakerDbSuccessResponse))
    const service = new SneakerService({
      apiKey: 'test-key',
      fetchImpl,
      rateLimiter: new RateLimiter({
        capacity: 1,
        refillIntervalMs: 20,
        now: () => now,
      }),
      retryQueue: new CompressedRetryQueue({
        delaysMs: [],
        maxBudgetMs: 10,
        sleep: async () => undefined,
      }),
      logger: { info: () => undefined, error: () => undefined },
    })

    const first = service.fetchSneakers({
      preferences: 'shoes',
      budget: { min: 0, max: 50 },
    })
    const secondPromise = service.fetchSneakers({
      preferences: 'shoes',
      budget: { min: 0, max: 50 },
    })

    await first
    now += 25
    await secondPromise
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
