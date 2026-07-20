import { describe, expect, it } from 'vitest'
import { BUDGET_RANGES } from '../../shared/types/budget'
import { BudgetValidator } from '../budget-validator'

const validBudgets = {
  under50: { min: 0, max: 50 },
  mid: { min: 50, max: 100 },
  upper: { min: 100, max: 150 },
  openEnded: { min: 150, max: Number.MAX_SAFE_INTEGER },
} as const

const invalidBudgets = {
  inverted: { min: 100, max: 50 },
  negativeMin: { min: -10, max: 50 },
  negativeMax: { min: 0, max: -1 },
  nonNumeric: { min: '50', max: 100 },
  nan: { min: Number.NaN, max: 100 },
  tooLarge: { min: 0, max: 1_000_000 },
} as const

describe('BudgetValidator', () => {
  const validator = new BudgetValidator()

  it('accepts all four predefined budget ranges', () => {
    for (const range of BUDGET_RANGES) {
      const result = validator.validate(range)
      expect(result.isValid).toBe(true)
      expect(result.validatedBudget).not.toBeNull()
    }
  })

  it('accepts concrete valid budget fixtures', () => {
    expect(validator.validate(validBudgets.under50).isValid).toBe(true)
    expect(validator.validate(validBudgets.mid).isValid).toBe(true)
    expect(validator.validate(validBudgets.upper).isValid).toBe(true)
  })

  it('normalizes $150+ max to sentinel 999999', () => {
    const result = validator.validate(validBudgets.openEnded)
    expect(result.isValid).toBe(true)
    expect(result.validatedBudget).toEqual({ min: 150, max: 999999 })
  })

  it('defaults missing budget to $50-$150', () => {
    expect(validator.validate(null)).toEqual({
      validatedBudget: { min: 50, max: 150 },
      isValid: true,
      validationErrors: [],
    })
    expect(validator.validate(undefined).validatedBudget).toEqual({
      min: 50,
      max: 150,
    })
  })

  it('rejects inverted ranges where min > max', () => {
    const result = validator.validate(invalidBudgets.inverted)
    expect(result.isValid).toBe(false)
    expect(result.validatedBudget).toBeNull()
    expect(result.validationErrors[0]).toMatch(/less than or equal/i)
  })

  it('accepts exact price point when min equals max', () => {
    const result = validator.validate({ min: 120, max: 120 })
    expect(result.isValid).toBe(true)
    expect(result.validatedBudget).toEqual({ min: 120, max: 120 })
  })

  it('rejects negative min or max', () => {
    expect(validator.validate(invalidBudgets.negativeMin).isValid).toBe(false)
    expect(validator.validate(invalidBudgets.negativeMax).isValid).toBe(false)
  })

  it('rejects non-numeric min or max', () => {
    const result = validator.validate(invalidBudgets.nonNumeric)
    expect(result.isValid).toBe(false)
    expect(result.validationErrors[0]).toMatch(/must be numbers/i)
  })

  it('rejects NaN and non-object budgets', () => {
    expect(validator.validate(invalidBudgets.nan).isValid).toBe(false)
    expect(validator.validate('not-an-object').isValid).toBe(false)
  })

  it('rejects values above the allowed upper bound', () => {
    const result = validator.validate(invalidBudgets.tooLarge)
    expect(result.isValid).toBe(false)
    expect(result.validationErrors[0]).toMatch(/999999/)
  })

  it('supports dependency-injected default budget', () => {
    const custom = new BudgetValidator({
      defaultBudget: { min: 0, max: 50 },
    })
    expect(custom.validate(null).validatedBudget).toEqual({ min: 0, max: 50 })
  })
})
