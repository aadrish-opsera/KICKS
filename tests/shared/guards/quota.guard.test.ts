import { describe, expect, it } from 'vitest'
import { createMockQuotaStatus } from '../../../src/shared/fixtures/quota.fixture'
import { isQuotaStatus } from '../../../src/shared/guards/quota.guard'

describe('isQuotaStatus', () => {
  it('returns true for valid quota status', () => {
    expect(isQuotaStatus(createMockQuotaStatus())).toBe(true)
    expect(isQuotaStatus(createMockQuotaStatus({ resetTime: null }))).toBe(true)
  })

  it('returns false for null, undefined, empty object, and wrong types', () => {
    expect(isQuotaStatus(null)).toBe(false)
    expect(isQuotaStatus(undefined)).toBe(false)
    expect(isQuotaStatus({})).toBe(false)
    expect(
      isQuotaStatus({
        remaining: '100',
        limit: 250,
        isExhausted: false,
        resetTime: null,
      }),
    ).toBe(false)
  })
})
