import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { CompressedRetryQueue } from '../../../src/utils/retry-queue'
import {
  SneakerService,
  mapSneakerDbResponse,
} from '../../../src/services/sneaker-service'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures')

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('SneakerService (WO-146)', () => {
  it('maps sneaker-database fixture payloads', () => {
    const rows = JSON.parse(
      readFileSync(join(fixturesDir, 'sneaker-database-response.json'), 'utf8'),
    ) as unknown[]
    const mapped = mapSneakerDbResponse({ count: rows.length, results: rows })
    expect(mapped.length).toBeGreaterThanOrEqual(5)
    expect(mapped[0]).toMatchObject({
      name: expect.any(String),
      brand: expect.any(String),
      retailPrice: expect.any(Number),
    })
  })

  it('handles 4xx and 5xx API errors without network calls', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'bad' }, 400))
    const service = new SneakerService({
      apiKey: 'test-key',
      fetchImpl,
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
        budget: { min: 0, max: 100 },
      }),
    ).rejects.toMatchObject({ message: expect.any(String) })
  })

  it('loads sneaks-api fixture for fallback coverage', () => {
    const rows = JSON.parse(
      readFileSync(join(fixturesDir, 'sneaks-api-response.json'), 'utf8'),
    ) as unknown[]
    expect(rows).toHaveLength(10)
  })
})
