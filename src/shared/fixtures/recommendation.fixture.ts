import type {
  RecommendationRequest,
  RecommendationResponse,
} from '../types/recommendation'
import { createMockBudgetRange } from './budget.fixture'
import { createMockSneaker } from './sneaker.fixture'

export function createMockRecommendationRequest(
  overrides: Partial<RecommendationRequest> = {},
): RecommendationRequest {
  return {
    preferences: 'comfortable running shoes under budget',
    budget: createMockBudgetRange(),
    ...overrides,
  }
}

export function createMockRecommendationResponse(
  overrides: Partial<RecommendationResponse> = {},
): RecommendationResponse {
  return {
    sneakers: [
      createMockSneaker({ id: 'sneaker-1' }),
      createMockSneaker({ id: 'sneaker-2' }),
      createMockSneaker({ id: 'sneaker-3' }),
      createMockSneaker({ id: 'sneaker-4' }),
      createMockSneaker({ id: 'sneaker-5' }),
    ],
    aiRankingAvailable: true,
    geminiQuotaRemaining: 200,
    queryTime: 850,
    sneakerApiSource: 'sneaker-db',
    ...overrides,
  }
}
