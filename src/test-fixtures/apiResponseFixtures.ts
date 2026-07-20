import type { RecommendationResponse } from '../shared/types/recommendation'
import { fiveSneakers } from './sneakerFixtures'

export const successResponse: RecommendationResponse = {
  sneakers: fiveSneakers,
  aiRankingAvailable: true,
  geminiQuotaRemaining: 200,
  queryTime: 1200,
  sneakerApiSource: 'sneaker-db',
}

export const degradedResponse: RecommendationResponse = {
  sneakers: fiveSneakers,
  aiRankingAvailable: false,
  geminiQuotaRemaining: 0,
  queryTime: 900,
  sneakerApiSource: 'sneaks-api',
  degradationReason: 'quota_exhausted',
  userMessage:
    'AI-powered explanations are temporarily unavailable. Results are sorted by price match to your budget.',
}

export const error400Response = {
  error: true,
  code: 'INVALID_INPUT',
  message: 'Please check your input and try again.',
} as const

export const error503Response = {
  error: true,
  code: 'SERVICE_UNAVAILABLE',
  message: 'We are having trouble finding sneakers right now. Please try again in a moment.',
} as const

export const error504Response = {
  error: true,
  code: 'GATEWAY_TIMEOUT',
  message: 'This is taking longer than expected. Please try again.',
} as const
