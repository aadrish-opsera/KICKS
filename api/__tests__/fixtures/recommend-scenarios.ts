import type { Sneaker } from '../../../src/shared/types/sneaker'

export const validRecommendRequest = {
  preferences: 'comfortable running shoes for daily training',
  budget: { min: 50, max: 150 },
} as const

export const invalidRecommendRequest = {
  preferences: 'ab',
  budget: { min: 200, max: 50 },
} as const

export const mockCandidates: Sneaker[] = [
  {
    id: 'c-1',
    name: 'Air Zoom Pegasus',
    brand: 'Nike',
    colorway: 'Black/White',
    retailPrice: 120,
    resalePrice: 135,
    imageUrl: 'https://example.com/1.jpg',
    resaleLinks: [],
    aiExplanation: null,
    aiRating: null,
  },
  {
    id: 'c-2',
    name: 'UltraBoost 22',
    brand: 'Adidas',
    colorway: 'Core Black',
    retailPrice: 140,
    resalePrice: null,
    imageUrl: 'https://example.com/2.jpg',
    resaleLinks: [],
    aiExplanation: null,
    aiRating: null,
  },
  {
    id: 'c-3',
    name: 'Fresh Foam 1080',
    brand: 'New Balance',
    colorway: 'Grey',
    retailPrice: 160,
    resalePrice: null,
    imageUrl: 'https://example.com/3.jpg',
    resaleLinks: [],
    aiExplanation: null,
    aiRating: null,
  },
  {
    id: 'c-4',
    name: 'Gel-Nimbus 25',
    brand: 'ASICS',
    colorway: 'Blue',
    retailPrice: 150,
    resalePrice: null,
    imageUrl: 'https://example.com/4.jpg',
    resaleLinks: [],
    aiExplanation: null,
    aiRating: null,
  },
  {
    id: 'c-5',
    name: 'Clifton 9',
    brand: 'Hoka',
    colorway: 'White',
    retailPrice: 145,
    resalePrice: null,
    imageUrl: 'https://example.com/5.jpg',
    resaleLinks: [],
    aiExplanation: null,
    aiRating: null,
  },
]
