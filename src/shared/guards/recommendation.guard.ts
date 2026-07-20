import type {
  RecommendationRequest,
  RecommendationResponse,
} from '../types/recommendation'
import { isBudgetRange } from './budget.guard'
import { isSneaker } from './sneaker.guard'

export function isRecommendationRequest(
  value: unknown,
): value is RecommendationRequest {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const request = value as Record<string, unknown>
  return (
    typeof request.preferences === 'string' &&
    request.preferences.length >= 3 &&
    request.preferences.length <= 500 &&
    isBudgetRange(request.budget)
  )
}

export function isRecommendationResponse(
  value: unknown,
): value is RecommendationResponse {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const response = value as Record<string, unknown>
  return (
    Array.isArray(response.sneakers) &&
    response.sneakers.length === 5 &&
    response.sneakers.every(isSneaker) &&
    typeof response.aiRankingAvailable === 'boolean' &&
    typeof response.geminiQuotaRemaining === 'number' &&
    typeof response.queryTime === 'number' &&
    typeof response.sneakerApiSource === 'string'
  )
}
