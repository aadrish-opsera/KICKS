import type { ResaleLink, Sneaker } from '../types/sneaker'

function isResaleLink(value: unknown): value is ResaleLink {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const link = value as Record<string, unknown>
  return typeof link.platform === 'string' && typeof link.url === 'string'
}

export function isSneaker(value: unknown): value is Sneaker {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const sneaker = value as Record<string, unknown>

  return (
    typeof sneaker.id === 'string' &&
    typeof sneaker.name === 'string' &&
    typeof sneaker.brand === 'string' &&
    typeof sneaker.colorway === 'string' &&
    typeof sneaker.retailPrice === 'number' &&
    (typeof sneaker.resalePrice === 'number' || sneaker.resalePrice === null) &&
    typeof sneaker.imageUrl === 'string' &&
    Array.isArray(sneaker.resaleLinks) &&
    sneaker.resaleLinks.every(isResaleLink) &&
    (typeof sneaker.aiExplanation === 'string' || sneaker.aiExplanation === null) &&
    (typeof sneaker.aiRating === 'number' || sneaker.aiRating === null)
  )
}
