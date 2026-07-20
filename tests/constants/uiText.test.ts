import { describe, expect, it } from 'vitest'
import { COMPARISON, ERRORS, HOME, LOADING, RESULTS } from '../../src/constants/uiText'

describe('uiText', () => {
  it('defines non-empty copy for all sections', () => {
    for (const section of [HOME, RESULTS, COMPARISON, ERRORS, LOADING]) {
      for (const value of Object.values(section)) {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      }
    }
  })
})
