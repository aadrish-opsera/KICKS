import { describe, expect, it } from 'vitest'
import {
  createInvalidBudgetRange,
  createInvalidErrorResponse,
  createInvalidQuotaStatus,
  createInvalidRecommendationRequest,
  createInvalidRecommendationResponse,
  createInvalidSneaker,
  createMockBudgetRange,
  createMockErrorResponse,
  createMockQuotaStatus,
  createMockRecommendationRequest,
  createMockRecommendationResponse,
  createMockSneaker,
} from '../../../src/shared/fixtures'
import {
  isBudgetRange,
  isErrorResponse,
  isQuotaStatus,
  isRecommendationRequest,
  isRecommendationResponse,
  isSneaker,
} from '../../../src/shared/guards'

describe('fixture factories', () => {
  it('createMock* outputs pass corresponding type guards', () => {
    expect(isSneaker(createMockSneaker())).toBe(true)
    expect(isBudgetRange(createMockBudgetRange())).toBe(true)
    expect(isRecommendationRequest(createMockRecommendationRequest())).toBe(true)
    expect(isRecommendationResponse(createMockRecommendationResponse())).toBe(true)
    expect(isErrorResponse(createMockErrorResponse())).toBe(true)
    expect(isQuotaStatus(createMockQuotaStatus())).toBe(true)
  })

  it('createInvalid* outputs fail corresponding type guards', () => {
    expect(isSneaker(createInvalidSneaker())).toBe(false)
    expect(isBudgetRange(createInvalidBudgetRange())).toBe(false)
    expect(isRecommendationRequest(createInvalidRecommendationRequest())).toBe(false)
    expect(isRecommendationResponse(createInvalidRecommendationResponse())).toBe(false)
    expect(isErrorResponse(createInvalidErrorResponse())).toBe(false)
    expect(isQuotaStatus(createInvalidQuotaStatus())).toBe(false)
  })
})
