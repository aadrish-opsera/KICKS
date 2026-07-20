import { describe, expect, it, vi } from 'vitest'
import { QuotaTracker } from '../../utils/quota-tracker'
import {
  ContentSafetyError,
  GeminiService,
  QuotaExhaustedError,
} from '../gemini-service'
import { candidateSneakerFixtures } from './fixtures/candidate-sneakers'
import {
  geminiMalformedResponse,
  geminiUnsafeResponse,
  geminiValidResponse,
} from './fixtures/gemini-responses'

describe('GeminiService', () => {
  it('ranks sneakers from a valid Gemini response', async () => {
    const text = geminiValidResponse.candidates[0].content.parts[0].text
    const service = new GeminiService({
      apiKey: 'test-key',
      quotaTracker: new QuotaTracker({ dailyLimit: 250 }),
      generate: async () => ({ text, tokensUsed: 420 }),
      logger: { info: () => undefined, error: () => undefined },
    })

    const result = await service.rankSneakers(
      'comfortable running shoes',
      { min: 50, max: 150 },
      candidateSneakerFixtures,
    )

    expect(result.aiRankingAvailable).toBe(true)
    expect(result.sneakers[0]?.aiExplanation).toMatch(/cushioning/i)
    expect(result.quotaRemaining).toBe(249)
  })

  it('throws QuotaExhaustedError before calling Gemini', async () => {
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

  it('falls back to degraded ranking on malformed JSON', async () => {
    const text = geminiMalformedResponse.candidates[0].content.parts[0].text
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
    expect(result.sneakers[0]?.aiExplanation).toBeNull()
  })

  it('falls back when content safety fails', async () => {
    const text = geminiUnsafeResponse.candidates[0].content.parts[0].text
    const service = new GeminiService({
      apiKey: 'test-key',
      generate: async () => ({ text, tokensUsed: 10 }),
      logger: { info: () => undefined, error: () => undefined },
    })

    const result = await service.rankSneakers(
      'shoes',
      { min: 50, max: 150 },
      candidateSneakerFixtures.slice(0, 1),
    )
    expect(result.aiRankingAvailable).toBe(false)
  })

  it('falls back on timeout/abort', async () => {
    const service = new GeminiService({
      apiKey: 'test-key',
      generate: async () => {
        const error = new Error('Aborted')
        error.name = 'AbortError'
        throw error
      },
      logger: { info: () => undefined, error: () => undefined },
    })

    const result = await service.rankSneakers(
      'shoes',
      { min: 50, max: 150 },
      candidateSneakerFixtures,
    )
    expect(result.aiRankingAvailable).toBe(false)
  })
})

describe('content safety helper behavior', () => {
  it('exposes ContentSafetyError type for callers', () => {
    expect(new ContentSafetyError().code).toBe('CONTENT_SAFETY')
  })
})
