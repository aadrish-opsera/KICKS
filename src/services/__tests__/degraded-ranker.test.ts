import { describe, expect, it } from 'vitest'
import { DegradedRanker } from '../degraded-ranker'
import type { SneakerResult } from '../sneaker-data-source'

function sneaker(
  partial: Pick<SneakerResult, 'id' | 'brand' | 'retailPrice'> &
    Partial<SneakerResult>,
): SneakerResult {
  return {
    name: partial.name ?? `Shoe ${partial.id}`,
    colorway: 'Test',
    resalePrice: null,
    imageUrl: 'https://example.com/x.jpg',
    resaleLinks: [],
    aiExplanation: 'should be cleared',
    aiRating: 99,
    ...partial,
  }
}

describe('DegradedRanker', () => {
  const ranker = new DegradedRanker()

  it('ranks by proximity to budget midpoint', () => {
    const ranked = ranker.rankByPriceRelevance({ min: 50, max: 100 }, [
      sneaker({ id: '1', brand: 'A', retailPrice: 40 }),
      sneaker({ id: '2', brand: 'B', retailPrice: 75 }),
      sneaker({ id: '3', brand: 'C', retailPrice: 200 }),
    ])

    expect(ranked[0]?.id).toBe('2')
    expect(ranked[0]?.rank).toBe(1)
    expect(ranked[0]?.aiExplanation).toBeNull()
    expect(ranked[0]?.aiRating).toBeNull()
  })

  it('uses midpoint 200 for open-ended $150+ budgets', () => {
    const ranked = ranker.rankByPriceRelevance({ min: 150, max: 999999 }, [
      sneaker({ id: 'near', brand: 'A', retailPrice: 210 }),
      sneaker({ id: 'far', brand: 'B', retailPrice: 400 }),
    ])
    expect(ranked[0]?.id).toBe('near')
  })

  it('applies brand diversity when prices tie', () => {
    const ranked = ranker.rankByPriceRelevance({ min: 50, max: 100 }, [
      sneaker({ id: 'n1', brand: 'Nike', retailPrice: 75 }),
      sneaker({ id: 'n2', brand: 'Nike', retailPrice: 75 }),
      sneaker({ id: 'n3', brand: 'Nike', retailPrice: 75 }),
      sneaker({ id: 'a1', brand: 'Adidas', retailPrice: 75 }),
      sneaker({ id: 'a2', brand: 'Adidas', retailPrice: 75 }),
    ])

    const brands = ranked.map((item) => item.brand)
    expect(brands.slice(0, 2).includes('Adidas')).toBe(true)
  })

  it('returns fewer than 5 candidates when that is all available', () => {
    const ranked = ranker.rankByPriceRelevance({ min: 0, max: 50 }, [
      sneaker({ id: '1', brand: 'A', retailPrice: 20 }),
      sneaker({ id: '2', brand: 'B', retailPrice: 25 }),
    ])
    expect(ranked).toHaveLength(2)
  })

  it('returns only top 5 when more candidates exist', () => {
    const sneakers = Array.from({ length: 8 }, (_, index) =>
      sneaker({
        id: String(index),
        brand: index % 2 === 0 ? 'Nike' : 'Adidas',
        retailPrice: 70 + index,
      }),
    )
    const ranked = ranker.rankByPriceRelevance({ min: 50, max: 100 }, sneakers)
    expect(ranked).toHaveLength(5)
    expect(ranked.map((item) => item.rank)).toEqual([1, 2, 3, 4, 5])
  })
})
