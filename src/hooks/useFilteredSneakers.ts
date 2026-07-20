import { useMemo } from 'react'
import type { Sneaker } from '../shared/types/sneaker'
import type { FilterState } from '../types/filters'

export function useFilteredSneakers(
  sneakers: readonly Sneaker[],
  filters: FilterState,
): readonly Sneaker[] {
  return useMemo(() => {
    return sneakers.filter((sneaker) => {
      if (
        filters.brand &&
        sneaker.brand.toLowerCase() !== filters.brand.toLowerCase()
      ) {
        return false
      }
      if (filters.priceMin != null && sneaker.retailPrice < filters.priceMin) {
        return false
      }
      if (filters.priceMax != null && sneaker.retailPrice > filters.priceMax) {
        return false
      }
      return true
    })
  }, [sneakers, filters])
}
