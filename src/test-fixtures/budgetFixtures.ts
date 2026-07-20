import { BUDGET_RANGES, DEFAULT_BUDGET, type BudgetRange } from '../types/budget'

export const budgetFixtures = {
  default: DEFAULT_BUDGET,
  ranges: BUDGET_RANGES,
  under50: BUDGET_RANGES[0]!,
  midLow: BUDGET_RANGES[1]!,
  midHigh: BUDGET_RANGES[2]!,
  openEnded: BUDGET_RANGES[3]!,
  unmatched: { min: 75, max: 125 },
} as const satisfies Record<string, BudgetRange | readonly BudgetRange[]>
