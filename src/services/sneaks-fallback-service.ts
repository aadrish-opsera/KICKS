import {
  CircuitBreaker,
  CircuitBreakerOpenError,
} from '../utils/circuit-breaker'
import { CompressedRetryQueue } from '../utils/retry-queue'
import { RateLimiter } from '../utils/rate-limiter'
import type {
  FetchSneakersInput,
  ISneakerDataSource,
  SneakerResult,
} from './sneaker-data-source'
import {
  consoleSneakerLogger,
  type SneakerLogger,
} from './sneaker-logger'
import {
  SneakerApiError,
  tokenizePreferences,
  type FetchLike,
} from './sneaker-service'

export type SneaksFallbackServiceConfig = {
  baseUrl: string
  requestTimeoutMs: number
  fetchImpl: FetchLike
  rateLimiter: RateLimiter
  circuitBreaker: CircuitBreaker
  retryQueue: CompressedRetryQueue
  logger: SneakerLogger
}

/**
 * Fallback sneaker data source using community Sneaks-API style endpoints.
 * Uses an independent circuit breaker from the primary SneakerService.
 */
export class SneaksFallbackService implements ISneakerDataSource {
  private readonly config: SneaksFallbackServiceConfig

  constructor(config: Partial<SneaksFallbackServiceConfig> = {}) {
    this.config = {
      baseUrl: 'https://sneaks-api.vercel.app/search',
      requestTimeoutMs: 2000,
      fetchImpl: fetch,
      rateLimiter: new RateLimiter(),
      circuitBreaker: new CircuitBreaker(),
      retryQueue: new CompressedRetryQueue(),
      logger: consoleSneakerLogger,
      ...config,
    }
  }

  async fetchSneakers(input: FetchSneakersInput): Promise<SneakerResult[]> {
    const startedAt = Date.now()
    let retryCount = 0

    try {
      this.config.circuitBreaker.beforeCall()
      await this.config.rateLimiter.acquire()

      const result = await this.config.retryQueue.run(
        async () => this.executeFetch(input),
        (error) => error instanceof SneakerApiError && error.retryable,
      )
      retryCount = result.retryCount
      this.config.circuitBreaker.recordSuccess()

      this.config.logger.info({
        sneakerApiLatencyMs: Date.now() - startedAt,
        sneakerApiStatus: 'success',
        retryCount,
        circuitBreakerState: this.config.circuitBreaker.getState(),
        message: 'sneaks-fallback',
      })

      return result.value
    } catch (error) {
      if (!(error instanceof CircuitBreakerOpenError)) {
        this.config.circuitBreaker.recordFailure()
      }

      this.config.logger.error({
        sneakerApiLatencyMs: Date.now() - startedAt,
        sneakerApiStatus:
          error instanceof CircuitBreakerOpenError ? 'circuit_open' : 'error',
        retryCount,
        circuitBreakerState: this.config.circuitBreaker.getState(),
        message: error instanceof Error ? error.message : 'Sneaks fallback failed',
      })

      throw error
    }
  }

  private async executeFetch(input: FetchSneakersInput): Promise<SneakerResult[]> {
    const keywords = tokenizePreferences(input.preferences).slice(0, 6).join(' ')
    const url = new URL(this.config.baseUrl)
    url.searchParams.set('q', keywords || 'sneakers')

    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.requestTimeoutMs,
    )

    try {
      const response = await this.config.fetchImpl(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })

      if (!response.ok) {
        const retryable =
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504
        throw new SneakerApiError(`Sneaks-API responded with ${response.status}`, {
          status: response.status,
          retryable,
        })
      }

      const payload: unknown = await response.json()
      return mapSneaksResponse(payload, input.budget.min, input.budget.max)
    } catch (error) {
      if (error instanceof SneakerApiError) {
        throw error
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SneakerApiError('Sneaks-API request timed out', {
          retryable: true,
          status: 504,
        })
      }
      throw new SneakerApiError(
        error instanceof Error ? error.message : 'Network error contacting Sneaks-API',
        { retryable: true },
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export function mapSneaksResponse(
  payload: unknown,
  minPrice: number,
  maxPrice: number,
): SneakerResult[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { products?: unknown }).products)
      ? ((payload as { products: unknown[] }).products)
      : null

  if (!records) {
    throw new SneakerApiError('Malformed Sneaks-API response', { retryable: false })
  }

  return records
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const retailPrice =
        typeof record.retailPrice === 'number'
          ? record.retailPrice
          : typeof record.price === 'number'
            ? record.price
            : null
      const name =
        typeof record.shoeName === 'string'
          ? record.shoeName
          : typeof record.name === 'string'
            ? record.name
            : null
      const brand = typeof record.brand === 'string' ? record.brand : null
      if (!name || !brand || retailPrice === null) {
        return null
      }
      if (retailPrice < minPrice || retailPrice > maxPrice) {
        return null
      }

      return {
        id: typeof record.styleID === 'string' ? record.styleID : `sneaks-${index}`,
        name,
        brand,
        colorway: typeof record.colorway === 'string' ? record.colorway : 'Unknown',
        retailPrice,
        resalePrice: typeof record.lowestResellPrice === 'number' ? record.lowestResellPrice : null,
        imageUrl:
          typeof record.thumbnail === 'string'
            ? record.thumbnail
            : 'https://example.com/missing-sneaker.jpg',
        resaleLinks: [],
        aiExplanation: null,
        aiRating: null,
      } satisfies SneakerResult
    })
    .filter((item): item is SneakerResult => item !== null)
}
