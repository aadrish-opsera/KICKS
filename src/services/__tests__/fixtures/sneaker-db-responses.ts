export const sneakerDbSuccessResponse = {
  count: 2,
  results: [
    {
      id: 'snk-001',
      shoeName: 'Air Zoom Pegasus',
      brand: 'Nike',
      colorway: 'Black/White',
      retailPrice: 120,
      lowestResellPrice: { stockX: 135 },
      thumbnail: 'https://example.com/pegasus.jpg',
      links: { stockX: 'https://stockx.com/pegasus' },
    },
    {
      id: 'snk-002',
      shoeName: 'UltraBoost 22',
      brand: 'Adidas',
      colorway: 'Core Black',
      retailPrice: 140,
      lowestResellPrice: null,
      thumbnail: 'https://example.com/ultraboost.jpg',
      links: { goat: 'https://goat.com/ultraboost' },
    },
  ],
} as const

export const sneakerDbRateLimitedResponse = {
  status: 429,
  body: { message: 'Rate limit exceeded' },
} as const

export const sneakerDbServerErrorResponse = {
  status: 503,
  body: { message: 'Service unavailable' },
} as const

export const sneakerDbMalformedResponse = {
  count: 1,
  results: [{ notASneaker: true }],
} as const
