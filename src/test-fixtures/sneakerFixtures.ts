import type { Sneaker } from '../shared/types/sneaker'

export const completeSneaker: Sneaker = {
  id: 'snk-001',
  name: 'Air Max 90',
  brand: 'Nike',
  colorway: 'White/Black',
  retailPrice: 130,
  resalePrice: 145,
  imageUrl: 'https://example.com/air-max-90.png',
  resaleLinks: [
    { platform: 'StockX', url: 'https://stockx.com/air-max-90' },
    { platform: 'GOAT', url: 'https://goat.com/air-max-90' },
  ],
  aiExplanation: 'Great everyday shoe that matches your blue and Nike preference.',
  aiRating: 92,
}

export const sneakerWithNoImage: Sneaker = {
  ...completeSneaker,
  id: 'snk-002',
  name: 'Samba OG',
  brand: 'Adidas',
  imageUrl: '',
}

export const sneakerWithNoExplanation: Sneaker = {
  ...completeSneaker,
  id: 'snk-003',
  aiExplanation: null,
  aiRating: null,
}

export const sneakerWithNoResaleLinks: Sneaker = {
  ...completeSneaker,
  id: 'snk-004',
  resalePrice: null,
  resaleLinks: [],
}

export const sneakerWithXSSExplanation: Sneaker = {
  ...completeSneaker,
  id: 'snk-005',
  aiExplanation: '<script>alert(1)</script>Soft cushioned runner for school.',
}

export const sneakerWithLongName: Sneaker = {
  ...completeSneaker,
  id: 'snk-006',
  name: 'Ultra Boost DNA Limited Edition Collaborative Colorway Extra Long Name',
}

export const sneakerWithZeroPrice: Sneaker = {
  ...completeSneaker,
  id: 'snk-007',
  retailPrice: 0,
}

export const fiveSneakers: readonly Sneaker[] = [
  completeSneaker,
  { ...completeSneaker, id: 'snk-010', name: 'Dunk Low', brand: 'Nike', retailPrice: 110 },
  { ...completeSneaker, id: 'snk-011', name: 'Gazelle', brand: 'Adidas', retailPrice: 90 },
  { ...completeSneaker, id: 'snk-012', name: '550', brand: 'New Balance', retailPrice: 120 },
  { ...completeSneaker, id: 'snk-013', name: 'Chuck 70', brand: 'Converse', retailPrice: 85 },
]
