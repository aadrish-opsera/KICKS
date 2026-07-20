/** Intentionally invalid objects for negative type-guard tests. */

export function createInvalidSneaker(): Record<string, unknown> {
  return {
    id: 123,
    name: 'Broken',
  }
}

export function createInvalidBudgetRange(): Record<string, unknown> {
  return {
    min: '0',
    max: 50,
  }
}

export function createInvalidRecommendationRequest(): Record<string, unknown> {
  return {
    preferences: 'no',
    budget: { min: 0, max: 50 },
  }
}

export function createInvalidRecommendationResponse(): Record<string, unknown> {
  return {
    sneakers: [],
    aiRankingAvailable: true,
    geminiQuotaRemaining: 1,
    queryTime: 10,
    sneakerApiSource: 'sneaker-db',
  }
}

export function createInvalidErrorResponse(): Record<string, unknown> {
  return {
    error: false,
    code: 'INTERNAL_ERROR',
    message: 'nope',
  }
}

export function createInvalidQuotaStatus(): Record<string, unknown> {
  return {
    remaining: '100',
    limit: 250,
    isExhausted: false,
    resetTime: null,
  }
}
