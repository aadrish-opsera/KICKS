/**
 * Inclusive USD budget window selected by the user.
 * For the top tier ($150+), `max` is `Number.MAX_SAFE_INTEGER`.
 */
export type BudgetRange = {
  /** Minimum budget in USD (inclusive, non-negative). */
  min: number
  /** Maximum budget in USD (inclusive). */
  max: number
}

/**
 * Predefined budget chips shown in the UI.
 * The last range represents $150+ with an open upper bound.
 */
export const BUDGET_RANGES: readonly BudgetRange[] = [
  { min: 0, max: 50 },
  { min: 50, max: 100 },
  { min: 100, max: 150 },
  { min: 150, max: Number.MAX_SAFE_INTEGER },
] as const
