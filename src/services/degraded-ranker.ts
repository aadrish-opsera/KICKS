import type { BudgetRange } from '../shared/types/budget'
import type { SneakerResult } from './sneaker-data-source'

export type RankedSneakerResult = SneakerResult & {
  rank: number
}

export interface IDegradedRanker {
  rankByPriceRelevance(
    budget: BudgetRange,
    sneakers: readonly SneakerResult[],
  ): RankedSneakerResult[]
}

/**
 * Non-AI fallback ranker: price proximity to budget midpoint + brand diversity.
 */
export class DegradedRanker implements IDegradedRanker {
  rankByPriceRelevance(
    budget: BudgetRange,
    sneakers: readonly SneakerResult[],
  ): RankedSneakerResult[] {
    const midpoint = resolveMidpoint(budget)

    const scored = sneakers.map((sneaker) => ({
      sneaker,
      score: 1 / (1 + Math.abs(sneaker.retailPrice - midpoint)),
    }))

    scored.sort((a, b) => b.score - a.score || a.sneaker.retailPrice - b.sneaker.retailPrice)

    const diversified = applyBrandDiversity(
      scored.map((entry) => entry.sneaker),
    )

    return diversified.slice(0, 5).map((sneaker, index) => ({
      ...sneaker,
      aiExplanation: null,
      aiRating: null,
      rank: index + 1,
    }))
  }
}

function resolveMidpoint(budget: BudgetRange): number {
  if (budget.max >= 999999) {
    return 200
  }
  return (budget.min + budget.max) / 2
}

function applyBrandDiversity(sneakers: SneakerResult[]): SneakerResult[] {
  const result = [...sneakers]

  for (let i = 0; i < result.length - 1; i += 1) {
    if (result[i]!.brand !== result[i + 1]!.brand) {
      continue
    }

    const swapIndex = result.findIndex(
      (candidate, index) => index > i + 1 && candidate.brand !== result[i]!.brand,
    )
    if (swapIndex === -1) {
      continue
    }

    const temp = result[i + 1]!
    result[i + 1] = result[swapIndex]!
    result[swapIndex] = temp
  }

  return result
}
