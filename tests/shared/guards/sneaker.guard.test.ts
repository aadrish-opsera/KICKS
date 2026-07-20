import { describe, expect, it } from 'vitest'
import { createMockSneaker } from '../../../src/shared/fixtures/sneaker.fixture'
import { isSneaker } from '../../../src/shared/guards/sneaker.guard'

describe('isSneaker', () => {
  it('returns true for a valid sneaker', () => {
    expect(isSneaker(createMockSneaker())).toBe(true)
  })

  it('returns false for null, undefined, and empty object', () => {
    expect(isSneaker(null)).toBe(false)
    expect(isSneaker(undefined)).toBe(false)
    expect(isSneaker({})).toBe(false)
  })

  it('returns false when required fields are missing or wrong-typed', () => {
    expect(isSneaker({ ...createMockSneaker(), id: 1 })).toBe(false)
    expect(isSneaker({ ...createMockSneaker(), retailPrice: '99' })).toBe(false)
    expect(isSneaker({ ...createMockSneaker(), resaleLinks: 'bad' })).toBe(false)
    const { name: _name, ...withoutName } = createMockSneaker()
    expect(isSneaker(withoutName)).toBe(false)
  })
})
