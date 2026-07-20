import { describe, expect, it } from 'vitest'
import { GracefulDegradation } from '../graceful-degradation'
import type { SneakerResult } from '../sneaker-data-source'

const sneakers: SneakerResult[] = [
  {
    id: '1',
    name: 'A',
    brand: 'Nike',
    colorway: 'Black',
    retailPrice: 70,
    resalePrice: null,
    imageUrl: 'https://example.com/a.jpg',
    resaleLinks: [],
    aiExplanation: 'keep?',
    aiRating: 9,
  },
  {
    id: '2',
    name: 'B',
    brand: 'Adidas',
    colorway: 'White',
    retailPrice: 90,
    resalePrice: null,
    imageUrl: 'https://example.com/b.jpg',
    resaleLinks: [],
    aiExplanation: 'keep?',
    aiRating: 8,
  },
]

describe('GracefulDegradation', () => {
  const degradation = new GracefulDegradation()

  it('skips Gemini when quota is exhausted', () => {
    expect(
      degradation.shouldSkipGemini({ canMakeRequest: false, elapsedMs: 100 }),
    ).toBe('quota_exhausted')
  })

  it('skips Gemini when less than 2 seconds remain', () => {
    expect(
      degradation.shouldSkipGemini({ canMakeRequest: true, elapsedMs: 8500 }),
    ).toBe('timeout_guard')
  })

  it('ranks by budget midpoint and clears AI fields', () => {
    const result = degradation.rank({ min: 50, max: 100 }, sneakers, 'gemini_error')
    expect(result.aiRankingAvailable).toBe(false)
    expect(result.degradationReason).toBe('gemini_error')
    expect(result.userMessage).toMatch(/temporarily unavailable/i)
    expect(result.sneakers[0]?.aiExplanation).toBeNull()
    expect(result.sneakers[0]?.id).toBe('1')
  })
})
