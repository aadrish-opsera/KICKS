import type { BudgetRange } from '../shared/types/budget'
import { DegradedRanker } from '../services/degraded-ranker'
import type { SneakerResult } from '../services/sneaker-data-source'

export type DegradationReason =
  | 'quota_exhausted'
  | 'gemini_error'
  | 'gemini_timeout'
  | 'timeout_guard'

export type DegradedRankingResult = {
  sneakers: SneakerResult[]
  aiRankingAvailable: false
  degradationReason: DegradationReason
  userMessage: string
}

const USER_MESSAGE =
  'AI-powered explanations are temporarily unavailable. Results are sorted by price match to your budget.'

/**
 * Central graceful-degradation helper for Gemini quota/error/timeout paths.
 */
export class GracefulDegradation {
  private readonly ranker: DegradedRanker

  constructor(ranker: DegradedRanker = new DegradedRanker()) {
    this.ranker = ranker
  }

  shouldSkipGemini(input: {
    canMakeRequest: boolean
    elapsedMs: number
    totalBudgetMs?: number
  }): DegradationReason | null {
    const totalBudgetMs = input.totalBudgetMs ?? 10_000
    const remaining = totalBudgetMs - input.elapsedMs
    if (!input.canMakeRequest) {
      return 'quota_exhausted'
    }
    if (remaining < 2000 || input.elapsedMs > 8000) {
      return 'timeout_guard'
    }
    return null
  }

  rank(
    budget: BudgetRange,
    candidates: readonly SneakerResult[],
    reason: DegradationReason,
  ): DegradedRankingResult {
    const ranked = this.ranker.rankByPriceRelevance(budget, candidates)
    return {
      sneakers: ranked.slice(0, 5).map(({ rank: _rank, ...sneaker }) => ({
        ...sneaker,
        aiExplanation: null,
        aiRating: null,
      })),
      aiRankingAvailable: false,
      degradationReason: reason,
      userMessage: USER_MESSAGE,
    }
  }
}
