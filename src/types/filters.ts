export type FilterState = {
  brand: string | null
  priceMin: number | null
  priceMax: number | null
  category: string | null
}

export const EMPTY_FILTER_STATE: FilterState = {
  brand: null,
  priceMin: null,
  priceMax: null,
  category: null,
}
