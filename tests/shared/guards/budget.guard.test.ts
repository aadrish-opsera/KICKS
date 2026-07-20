import { describe, expect, it } from 'vitest'
import { createMockBudgetRange } from '../../../src/shared/fixtures/budget.fixture'
import {
  isBudgetRange,
  isValidBudgetRange,
} from '../../../src/shared/guards/budget.guard'

describe('isBudgetRange', () => {
  it('returns true for valid ranges', () => {
    expect(isBudgetRange(createMockBudgetRange())).toBe(true)
  })

  it('returns false for null, undefined, empty object, and wrong types', () => {
    expect(isBudgetRange(null)).toBe(false)
    expect(isBudgetRange(undefined)).toBe(false)
    expect(isBudgetRange({})).toBe(false)
    expect(isBudgetRange({ min: '0', max: 50 })).toBe(false)
  })
})

describe('isValidBudgetRange', () => {
  it('requires non-negative min and min < max', () => {
    expect(isValidBudgetRange({ min: 0, max: 50 })).toBe(true)
    expect(isValidBudgetRange({ min: -1, max: 50 })).toBe(false)
    expect(isValidBudgetRange({ min: 100, max: 50 })).toBe(false)
    expect(isValidBudgetRange({ min: 50, max: 50 })).toBe(false)
  })
})
