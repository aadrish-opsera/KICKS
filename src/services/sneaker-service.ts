import type { BudgetRange } from '../shared/types/budget'
import type { Sneaker } from '../shared/types/sneaker'
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

export type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>

export type SneakerServiceConfig = {
  baseUrl: string
  apiKey?: string
  requestTimeoutMs: number
  fetchImpl: FetchLike
  rateLimiter: RateLimiter
  circuitBreaker: CircuitBreaker
  retryQueue: CompressedRetryQueue
  logger: SneakerLogger
}

export class SneakerApiError extends Error {
  readonly status?: number
  readonly retryable: boolean

  constructor(message: string, options?: { status?: number; retryable?: boolean }) {
    super(message)
    this.name = 'SneakerApiError'
    this.status = options?.status
    this.retryable = options?.retryable ?? false
  }
}

/**
 * Primary sneaker data source backed by The Sneaker Database API.
 */
export class SneakerService implements ISneakerDataSource {
  private readonly config: SneakerServiceConfig

  constructor(config: Partial<SneakerServiceConfig> = {}) {
    this.config = {
      baseUrl: 'https://api.thesneakerdatabase.com/v1/sneakers',
      apiKey: process.env.SNEAKER_DB_API_KEY,
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
        (error) => isRetryableError(error),
      )
      retryCount = result.retryCount

      this.config.circuitBreaker.recordSuccess()
      this.config.logger.info({
        sneakerApiLatencyMs: Date.now() - startedAt,
        sneakerApiStatus: 'success',
        retryCount,
        circuitBreakerState: this.config.circuitBreaker.getState(),
      })

      return result.value
    } catch (error) {
      if (!(error instanceof CircuitBreakerOpenError)) {
        this.config.circuitBreaker.recordFailure()
      }

      const status =
        error instanceof CircuitBreakerOpenError ? 'circuit_open' : 'error'

      this.config.logger.error({
        sneakerApiLatencyMs: Date.now() - startedAt,
        sneakerApiStatus: status,
        retryCount,
        circuitBreakerState: this.config.circuitBreaker.getState(),
        message: error instanceof Error ? error.message : 'Unknown sneaker API error',
      })

      throw error
    }
  }

  private async executeFetch(input: FetchSneakersInput): Promise<SneakerResult[]> {
    if (!this.config.apiKey) {
      throw new SneakerApiError('SNEAKER_DB_API_KEY is missing', {
        retryable: false,
        status: 401,
      })
    }

    const url = this.buildUrl(input.preferences, input.budget)
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.requestTimeoutMs,
    )

    try {
      const response = await this.config.fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'x-api-key': this.config.apiKey,
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new SneakerApiError(`Sneaker DB responded with ${response.status}`, {
          status: response.status,
          retryable: isRetryableStatus(response.status),
        })
      }

      const payload: unknown = await response.json()
      return mapSneakerDbResponse(payload)
    } catch (error) {
      if (error instanceof SneakerApiError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new SneakerApiError('Sneaker DB request timed out', {
          retryable: true,
          status: 504,
        })
      }

      throw new SneakerApiError(
        error instanceof Error ? error.message : 'Network error contacting Sneaker DB',
        { retryable: true },
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private buildUrl(preferences: string, budget: BudgetRange): string {
    const keywords = tokenizePreferences(preferences)
    const url = new URL(this.config.baseUrl)
    url.searchParams.set('limit', '20')
    url.searchParams.set('page', '1')
    if (keywords.length > 0) {
      url.searchParams.set('name', keywords.slice(0, 6).join(' '))
    }
    url.searchParams.set('retailPrice[gte]', String(budget.min))
    url.searchParams.set('retailPrice[lte]', String(budget.max))
    return url.toString()
  }
}

export function tokenizePreferences(preferences: string): string[] {
  return preferences
    .toLowerCase()
    .split(/[^a-z0-9+$]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
}

export function mapSneakerDbResponse(payload: unknown): SneakerResult[] {
  if (!payload || typeof payload !== 'object') {
    throw new SneakerApiError('Malformed Sneaker DB response', { retryable: false })
  }

  const results = (payload as { results?: unknown }).results
  if (!Array.isArray(results)) {
    throw new SneakerApiError('Malformed Sneaker DB response: missing results', {
      retryable: false,
    })
  }

  return results.map((item, index) => mapSneakerRecord(item, index))
}

function mapSneakerRecord(item: unknown, index: number): Sneaker {
  if (!item || typeof item !== 'object') {
    throw new SneakerApiError('Malformed sneaker record', { retryable: false })
  }

  const record = item as Record<string, unknown>
  const id = stringField(record.id) ?? `generated-${index}`
  const name = stringField(record.shoeName) ?? stringField(record.name)
  const brand = stringField(record.brand)
  const colorway = stringField(record.colorway) ?? 'Unknown'
  const retailPrice = numberField(record.retailPrice)
  const imageUrl =
    stringField(record.thumbnail) ??
    stringField(record.image) ??
    'https://example.com/missing-sneaker.jpg'

  if (!name || !brand || retailPrice === null) {
    throw new SneakerApiError('Malformed sneaker record: required fields missing', {
      retryable: false,
    })
  }

  const resalePrice = extractResalePrice(record.lowestResellPrice)
  const resaleLinks = extractResaleLinks(record.links)

  return {
    id,
    name,
    brand,
    colorway,
    retailPrice,
    resalePrice,
    imageUrl,
    resaleLinks,
    aiExplanation: null,
    aiRating: null,
  }
}

function extractResalePrice(value: unknown): number | null {
  if (typeof value === 'number') {
    return value
  }
  if (value && typeof value === 'object') {
    const prices = Object.values(value as Record<string, unknown>)
      .map((entry) => (typeof entry === 'number' ? entry : null))
      .filter((entry): entry is number => entry !== null)
    return prices.length > 0 ? Math.min(...prices) : null
  }
  return null
}

function extractResaleLinks(
  value: unknown,
): ReadonlyArray<{ platform: string; url: string }> {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([platform, url]) => ({ platform, url }))
}

function stringField(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function numberField(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

function isRetryableError(error: unknown): boolean {
  return error instanceof SneakerApiError && error.retryable
}
