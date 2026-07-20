import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formats positive USD amounts', () => {
    expect(formatCurrency(130)).toBe('$130')
  })

  it('returns N/A for missing or zero prices', () => {
    expect(formatCurrency(null)).toBe('N/A')
    expect(formatCurrency(undefined)).toBe('N/A')
    expect(formatCurrency(0)).toBe('N/A')
  })
})
