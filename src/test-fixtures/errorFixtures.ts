export const errorMessageFixtures = [
  {
    code: 'SNEAKER_API_UNAVAILABLE',
    message: 'We are having trouble finding sneakers right now. Please try again in a moment.',
  },
  {
    code: 'GEMINI_API_UNAVAILABLE',
    message: 'Our recommendation engine is taking a break. Please try again shortly.',
  },
  {
    code: 'GATEWAY_TIMEOUT',
    message: 'This is taking longer than expected. Please try again.',
  },
  {
    code: 'INVALID_INPUT',
    message: 'Please check your input and try again.',
  },
  {
    code: 'NETWORK_ERROR',
    message: 'It looks like you are offline. Please check your connection and try again.',
  },
] as const
