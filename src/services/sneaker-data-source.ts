import type { BudgetRange } from '../shared/types/budget'
import type { Sneaker } from '../shared/types/sneaker'

/** Alias used by data-source services (maps to shared Sneaker contract). */
export type SneakerResult = Sneaker

export type FetchSneakersInput = {
  preferences: string
  budget: BudgetRange
}

export interface ISneakerDataSource {
  fetchSneakers(input: FetchSneakersInput): Promise<SneakerResult[]>
}
