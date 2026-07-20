import type { Sneaker } from '../types/sneaker'

export function createMockSneaker(overrides: Partial<Sneaker> = {}): Sneaker {
  return {
    id: 'sneaker-1',
    name: 'Test Sneaker',
    brand: 'TestBrand',
    colorway: 'Black/White',
    retailPrice: 99.99,
    resalePrice: 120,
    imageUrl: 'https://example.com/sneaker.jpg',
    resaleLinks: [{ platform: 'StockX', url: 'https://example.com/stockx' }],
    aiExplanation: 'Strong match for comfort and budget.',
    aiRating: 88,
    ...overrides,
  }
}
