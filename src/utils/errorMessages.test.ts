import { describe, expect, it } from 'vitest'
import { errorMessageFixtures } from '../test-fixtures/errorFixtures'
import { getErrorMessage } from './errorMessages'

describe('getErrorMessage', () => {
  it('maps each known error code to the expected message', () => {
    for (const fixture of errorMessageFixtures) {
      expect(getErrorMessage(fixture.code).message).toBe(fixture.message)
    }
  })

  it('falls back for unknown, null, and undefined codes', () => {
    expect(getErrorMessage('NOT_A_REAL_CODE').title).toBe('Something went wrong')
    expect(getErrorMessage(null).message).toMatch(/try again/i)
    expect(getErrorMessage(undefined).message).toMatch(/try again/i)
  })
})
