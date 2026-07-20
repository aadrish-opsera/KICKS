/** Resale marketplace link for a sneaker. */
export type ResaleLink = {
  /** Marketplace name (e.g. StockX, GOAT). */
  platform: string
  /** Absolute URL to the listing. */
  url: string
}

/**
 * Canonical sneaker product shape returned by recommendation APIs.
 * Nullable price/rating fields use explicit `null` so callers must handle absence.
 */
export type Sneaker = {
  /** Stable product identifier from the sneaker data source. */
  id: string
  /** Display name of the sneaker. */
  name: string
  /** Brand name (e.g. Nike, Adidas). */
  brand: string
  /** Colorway description. */
  colorway: string
  /** Official retail price in USD. */
  retailPrice: number
  /** Current resale price in USD, or null when unknown. */
  resalePrice: number | null
  /** Primary product image URL. */
  imageUrl: string
  /** Marketplace links for purchase/resale. */
  resaleLinks: ReadonlyArray<ResaleLink>
  /** AI-generated explanation of the recommendation, or null when AI ranking is unavailable. */
  aiExplanation: string | null
  /** AI match score (typically 0–100), or null when AI ranking is unavailable. */
  aiRating: number | null
}
