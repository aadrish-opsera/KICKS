import type { BudgetRange } from '../types/budget'

export function isBudgetRange(value: unknown): value is BudgetRange {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const range = value as Record<string, unknown>
  return typeof range.min === 'number' && typeof range.max === 'number'
}

/** Structural BudgetRange plus domain constraints (non-negative min, min < max). */
export function isValidBudgetRange(value: unknown): value is BudgetRange {
  return isBudgetRange(value) && value.min >= 0 && value.min < value.max
}
