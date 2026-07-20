import type { BudgetRange } from '../types/budget'

export function createMockBudgetRange(
  overrides: Partial<BudgetRange> = {},
): BudgetRange {
  return {
    min: 50,
    max: 100,
    ...overrides,
  }
}
