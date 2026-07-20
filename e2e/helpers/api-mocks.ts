import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page, Route } from '@playwright/test'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(fixturesDir, name), 'utf8')) as T
}

const successFixture = loadJson<Record<string, unknown>>('mock-recommend-success.json')
const degradedFixture = loadJson<Record<string, unknown>>('mock-recommend-degraded.json')
const errorFixture = loadJson<{
  sneakerApiUnavailable: Record<string, unknown>
  geminiApiUnavailable: Record<string, unknown>
  serviceUnavailable: Record<string, unknown>
  gatewayTimeout: Record<string, unknown>
}>('mock-recommend-error.json')

export type RecommendMockMode =
  | 'success'
  | 'degraded'
  | 'sneaker-error'
  | 'gemini-error'
  | 'success-after-error'

type MockOptions = {
  /** Artificial delay before responding (ms). */
  delayMs?: number
  /** Optional custom JSON body for success-like responses. */
  body?: unknown
  status?: number
}

function json(route: Route, status: number, body: unknown): Promise<void> {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

/**
 * Intercept /api/recommend (and optionally /api/health) so E2E never hits real providers.
 */
export async function mockRecommendApi(
  page: Page,
  mode: RecommendMockMode = 'success',
  options: MockOptions = {},
): Promise<void> {
  let recommendCalls = 0

  await page.route('**/api/health', async (route) => {
    await json(route, 200, {
      status: 'ok',
      sneakerApi: 'up',
      geminiApi: 'up',
      geminiQuotaRemaining: 200,
    })
  })

  await page.route('**/api/recommend', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204 })
      return
    }

    recommendCalls += 1
    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs))
    }

    if (mode === 'success-after-error') {
      if (recommendCalls === 1) {
        await json(route, 503, errorFixture.sneakerApiUnavailable)
        return
      }
      await json(route, 200, options.body ?? successFixture)
      return
    }

    if (mode === 'sneaker-error') {
      await json(
        route,
        options.status ?? 503,
        options.body ?? errorFixture.sneakerApiUnavailable,
      )
      return
    }

    if (mode === 'gemini-error') {
      await json(
        route,
        options.status ?? 503,
        options.body ?? errorFixture.geminiApiUnavailable,
      )
      return
    }

    if (mode === 'degraded') {
      await json(route, 200, options.body ?? degradedFixture)
      return
    }

    await json(route, 200, options.body ?? successFixture)
  })
}

export async function fillHomeAndSubmit(
  page: Page,
  preferences = 'blue Nike runners for school',
  budgetLabel = '$50 - $100',
): Promise<void> {
  await page.goto('/')
  await page.getByLabel(/what kind of sneakers/i).fill(preferences)
  await page.getByRole('radio', { name: budgetLabel }).click()
  await page.getByRole('button', { name: /find my sneakers/i }).click()
}

export { successFixture, degradedFixture, errorFixture }
