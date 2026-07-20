import { describe, expect, it } from 'vitest'
import {
  createMockRecommendationRequest,
  createMockRecommendationResponse,
} from '../../../src/shared/fixtures/recommendation.fixture'
import {
  isRecommendationRequest,
  isRecommendationResponse,
} from '../../../src/shared/guards/recommendation.guard'

describe('isRecommendationRequest', () => {
  it('returns true for valid requests', () => {
    expect(isRecommendationRequest(createMockRecommendationRequest())).toBe(true)
  })

  it('returns false for null, undefined, empty object, and short preferences', () => {
    expect(isRecommendationRequest(null)).toBe(false)
    expect(isRecommendationRequest(undefined)).toBe(false)
    expect(isRecommendationRequest({})).toBe(false)
    expect(
      isRecommendationRequest(createMockRecommendationRequest({ preferences: 'ab' })),
    ).toBe(false)
  })
})

describe('isRecommendationResponse', () => {
  it('returns true for valid responses with exactly five sneakers', () => {
    expect(isRecommendationResponse(createMockRecommendationResponse())).toBe(true)
  })

  it('returns false for null, undefined, empty object, and wrong sneaker count', () => {
    expect(isRecommendationResponse(null)).toBe(false)
    expect(isRecommendationResponse(undefined)).toBe(false)
    expect(isRecommendationResponse({})).toBe(false)
    expect(
      isRecommendationResponse(
        createMockRecommendationResponse({ sneakers: [] }),
      ),
    ).toBe(false)
  })
})
