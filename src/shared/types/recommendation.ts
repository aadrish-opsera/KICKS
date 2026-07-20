import type { BudgetRange } from './budget'
import type { Sneaker } from './sneaker'

/** Payload sent to POST /api/recommend. */
export type RecommendationRequest = {
  /** Natural-language preference text (expected length 3–500). */
  preferences: string
  /** Selected budget window. */
  budget: BudgetRange
}

/**
 * Successful recommendation payload.
 * `sneakers` is always exactly five ranked items when the contract is satisfied.
 */
export type RecommendationResponse = {
  /** Ranked sneakers (contract length: 5). */
  sneakers: ReadonlyArray<Sneaker>
  /** Whether Gemini ranking was used (false when degraded/fallback). */
  aiRankingAvailable: boolean
  /** Remaining Gemini daily quota after this request (-1 when unknown). */
  geminiQuotaRemaining: number
  /** End-to-end query time in milliseconds. */
  queryTime: number
  /** Which sneaker data source produced the candidates (e.g. sneaker-db, sneaks-api). */
  sneakerApiSource: string
  /** Present when AI ranking was skipped or failed over to degraded sorting. */
  degradationReason?:
    | 'quota_exhausted'
    | 'gemini_error'
    | 'gemini_timeout'
    | 'timeout_guard'
  /** Safe user-facing degradation message. */
  userMessage?: string
}
