import type { BudgetRange } from '../shared/types/budget'
import type { RecommendationRequest, RecommendationResponse } from '../shared/types/recommendation'
import type { Sneaker } from '../shared/types/sneaker'

export type { BudgetRange, RecommendationRequest, RecommendationResponse, Sneaker }

export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SNEAKER_API_UNAVAILABLE'
  | 'GEMINI_API_UNAVAILABLE'
  | 'UNKNOWN_ERROR'

export class RecommendationApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number | null

  constructor(code: ApiErrorCode, message: string, status: number | null = null) {
    super(message)
    this.name = 'RecommendationApiError'
    this.code = code
    this.status = status
  }
}

export type RecommendClient = (
  request: RecommendationRequest,
  signal?: AbortSignal,
) => Promise<RecommendationResponse>

function mapStatusToCode(status: number): ApiErrorCode {
  if (status === 400) {
    return 'INVALID_INPUT'
  }
  if (status === 504) {
    return 'GATEWAY_TIMEOUT'
  }
  if (status === 503) {
    return 'SERVICE_UNAVAILABLE'
  }
  return 'UNKNOWN_ERROR'
}

export async function postRecommendation(
  request: RecommendationRequest,
  signal?: AbortSignal,
): Promise<RecommendationResponse> {
  let response: Response
  try {
    response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    })
  } catch {
    throw new RecommendationApiError(
      'NETWORK_ERROR',
      'It looks like you are offline. Please check your connection and try again.',
      null,
    )
  }

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    if (!response.ok) {
      throw new RecommendationApiError(
        mapStatusToCode(response.status),
        'Something went wrong. Please try again.',
        response.status,
      )
    }
    throw new RecommendationApiError(
      'UNKNOWN_ERROR',
      'Something went wrong. Please try again.',
      response.status,
    )
  }

  if (!response.ok) {
    const code =
      payload &&
      typeof payload === 'object' &&
      'code' in payload &&
      typeof (payload as { code: unknown }).code === 'string'
        ? ((payload as { code: string }).code as ApiErrorCode)
        : mapStatusToCode(response.status)
    const message =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : 'Something went wrong. Please try again.'
    throw new RecommendationApiError(code, message, response.status)
  }

  return payload as RecommendationResponse
}
