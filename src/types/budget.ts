export type { BudgetRange } from '../shared/types/budget'
export { BUDGET_RANGES } from '../shared/types/budget'

/** Backend/UI default when no budget chip has been chosen yet. */
export const DEFAULT_BUDGET = { min: 50, max: 150 } as const

export function budgetsEqual(
  a: { min: number; max: number },
  b: { min: number; max: number },
): boolean {
  return a.min === b.min && a.max === b.max
}

export function formatBudgetLabel(range: { min: number; max: number }): string {
  if (range.min >= 150) {
    return '$150+'
  }
  return `$${range.min} - $${range.max}`
}
