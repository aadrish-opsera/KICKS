import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { QuotaTracker } from '../../../src/utils/quota-tracker'
import {
  GeminiService,
  QuotaExhaustedError,
} from '../../../src/services/gemini-service'
import { candidateSneakerFixtures } from '../../../src/services/__tests__/fixtures/candidate-sneakers'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures')

describe('GeminiService (WO-146)', () => {
  it('parses ranking fixture into AI-ranked sneakers', async () => {
    const fixture = JSON.parse(
      readFileSync(join(fixturesDir, 'gemini-ranking-response.json'), 'utf8'),
    ) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>
    }
    const text = fixture.candidates[0]!.content.parts[0]!.text
    const service = new GeminiService({
      apiKey: 'test-key',
      quotaTracker: new QuotaTracker({ dailyLimit: 250 }),
      generate: async () => ({ text, tokensUsed: 100 }),
      logger: { info: () => undefined, error: () => undefined },
    })

    const result = await service.rankSneakers(
      'comfortable running shoes',
      { min: 50, max: 150 },
      candidateSneakerFixtures,
    )
    expect(result.aiRankingAvailable).toBe(true)
    expect(result.sneakers[0]?.aiExplanation).toMatch(/cushioning/i)
  })

  it('degrades on malformed ranking fixture variants', async () => {
    const malformed = JSON.parse(
      readFileSync(join(fixturesDir, 'gemini-malformed-response.json'), 'utf8'),
    ) as { variants: Array<{ text: string }> }
    const text = malformed.variants[0]!.text
    const service = new GeminiService({
      apiKey: 'test-key',
      generate: async () => ({ text, tokensUsed: 10 }),
      logger: { info: () => undefined, error: () => undefined },
    })
    const result = await service.rankSneakers(
      'shoes',
      { min: 50, max: 150 },
      candidateSneakerFixtures,
    )
    expect(result.aiRankingAvailable).toBe(false)
  })

  it('skips Gemini when quota is exhausted (pre-flight)', async () => {
    const generate = vi.fn()
    const tracker = new QuotaTracker({ dailyLimit: 1 })
    tracker.increment()
    const service = new GeminiService({
      apiKey: 'test-key',
      quotaTracker: tracker,
      generate,
      logger: { info: () => undefined, error: () => undefined },
    })
    await expect(
      service.rankSneakers('shoes', { min: 0, max: 50 }, candidateSneakerFixtures),
    ).rejects.toBeInstanceOf(QuotaExhaustedError)
    expect(generate).not.toHaveBeenCalled()
  })
})
