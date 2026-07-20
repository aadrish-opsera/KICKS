import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { InputSanitizer } from '../../../src/services/input-sanitizer'
import { BudgetValidator } from '../../../src/services/budget-validator'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures')

type InvalidFixture = {
  cases: Array<{ preferences: string; budget: { min: number; max: number }; reason: string }>
}

type MaliciousFixture = {
  cases: Array<{ preferences: string; budget: { min: number; max: number }; kind: string }>
}

describe('InputValidator (WO-146)', () => {
  const sanitizer = new InputSanitizer()
  const budgets = new BudgetValidator()

  it('accepts valid user input fixture', () => {
    const valid = JSON.parse(
      readFileSync(join(fixturesDir, 'user-input-valid.json'), 'utf8'),
    ) as { preferences: string; budget: { min: number; max: number } }
    const result = sanitizer.sanitize(valid.preferences)
    expect(result.isValid).toBe(true)
    expect(budgets.validate(valid.budget).isValid).toBe(true)
  })

  it('rejects invalid fixture cases', () => {
    const invalid = JSON.parse(
      readFileSync(join(fixturesDir, 'user-input-invalid.json'), 'utf8'),
    ) as InvalidFixture
    for (const item of invalid.cases) {
      const pref = sanitizer.sanitize(item.preferences)
      const budget = budgets.validate(item.budget)
      expect(pref.isValid && budget.isValid, item.reason).toBe(false)
    }
  })

  it('sanitizes malicious fixture payloads', () => {
    const malicious = JSON.parse(
      readFileSync(join(fixturesDir, 'user-input-malicious.json'), 'utf8'),
    ) as MaliciousFixture
    for (const item of malicious.cases) {
      const result = sanitizer.sanitize(item.preferences)
      if (item.kind === 'xss') {
        expect(result.sanitizedText.toLowerCase()).not.toMatch(/<script/)
      }
      if (item.kind === 'prompt-injection') {
        expect(result.isValid).toBe(false)
      }
    }
  })
})
