import { describe, expect, it } from 'vitest'
import { createMockErrorResponse } from '../../../src/shared/fixtures/error.fixture'
import { isErrorResponse } from '../../../src/shared/guards/error.guard'

describe('isErrorResponse', () => {
  it('returns true for valid error responses', () => {
    expect(isErrorResponse(createMockErrorResponse())).toBe(true)
  })

  it('returns false for null, undefined, empty object, and invalid shapes', () => {
    expect(isErrorResponse(null)).toBe(false)
    expect(isErrorResponse(undefined)).toBe(false)
    expect(isErrorResponse({})).toBe(false)
    expect(isErrorResponse({ error: false, code: 'INTERNAL_ERROR', message: 'x' })).toBe(
      false,
    )
    expect(isErrorResponse({ error: true, code: 'UNKNOWN', message: 'x' })).toBe(false)
  })
})
