import { describe, expect, it } from 'vitest'
import {
  preferenceXssPayloads,
  preferenceValidInputs,
} from '../test-fixtures/preferenceInputFixtures'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(null)).toBe('')
    expect(sanitizeInput(42)).toBe('')
    expect(sanitizeInput(undefined)).toBe('')
  })

  it('preserves normal preference text', () => {
    for (const value of preferenceValidInputs) {
      expect(sanitizeInput(value).length).toBeGreaterThanOrEqual(3)
    }
  })

  it('strips HTML tags and script payloads', () => {
    expect(sanitizeInput('<script>alert(1)</script>blue nike')).toBe('blue nike')
    expect(sanitizeInput(preferenceXssPayloads[0]!)).not.toMatch(/<script/i)
    expect(sanitizeInput(preferenceXssPayloads[0]!)).not.toMatch(/alert/i)
  })

  it('removes event handlers and dangerous URIs', () => {
    expect(sanitizeInput('shoes <img src=x onerror="alert(1)">')).not.toMatch(/onerror/i)
    expect(sanitizeInput('javascript:alert(1) runners')).not.toMatch(/javascript:/i)
  })

  it('escapes leftover angle brackets by removing them', () => {
    expect(sanitizeInput('foo < bar > baz')).toBe('foo  bar  baz')
  })

  it('handles empty and unicode input without stripping intentional spaces', () => {
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput('  👟 red  ')).toBe('  👟 red  ')
  })
})
