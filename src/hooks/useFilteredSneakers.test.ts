import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { fiveSneakers } from '../test-fixtures/sneakerFixtures'
import { EMPTY_FILTER_STATE } from '../types/filters'
import { useFilteredSneakers } from './useFilteredSneakers'

describe('useFilteredSneakers', () => {
  it('returns all sneakers when filters are empty', () => {
    const { result } = renderHook(() =>
      useFilteredSneakers(fiveSneakers, EMPTY_FILTER_STATE),
    )
    expect(result.current).toHaveLength(5)
  })

  it('filters by brand case-insensitively', () => {
    const { result } = renderHook(() =>
      useFilteredSneakers(fiveSneakers, { ...EMPTY_FILTER_STATE, brand: 'nike' }),
    )
    expect(result.current.every((item) => item.brand.toLowerCase() === 'nike')).toBe(
      true,
    )
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('filters by price range', () => {
    const { result } = renderHook(() =>
      useFilteredSneakers(fiveSneakers, {
        ...EMPTY_FILTER_STATE,
        priceMin: 100,
        priceMax: 120,
      }),
    )
    expect(
      result.current.every(
        (item) => item.retailPrice >= 100 && item.retailPrice <= 120,
      ),
    ).toBe(true)
  })

  it('returns empty array when nothing matches', () => {
    const { result } = renderHook(() =>
      useFilteredSneakers(fiveSneakers, {
        ...EMPTY_FILTER_STATE,
        brand: 'NotARealBrand',
      }),
    )
    expect(result.current).toHaveLength(0)
  })
})
