export type ErrorCode =
  | 'SNEAKER_API_UNAVAILABLE'
  | 'GEMINI_API_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'
  | 'INVALID_INPUT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'
  | 'SERVICE_UNAVAILABLE'

export type ErrorMessage = {
  title: string
  message: string
  icon: string
}

const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  SNEAKER_API_UNAVAILABLE: {
    title: 'Sneakers are hard to find right now',
    message: 'We are having trouble finding sneakers right now. Please try again in a moment.',
    icon: '👟',
  },
  GEMINI_API_UNAVAILABLE: {
    title: 'Recommendations are resting',
    message: 'Our recommendation engine is taking a break. Please try again shortly.',
    icon: '😴',
  },
  GATEWAY_TIMEOUT: {
    title: 'This is taking a while',
    message: 'This is taking longer than expected. Please try again.',
    icon: '⏳',
  },
  INVALID_INPUT: {
    title: 'Please check your words',
    message: 'Please check your input and try again.',
    icon: '✏️',
  },
  NETWORK_ERROR: {
    title: 'You might be offline',
    message: 'It looks like you are offline. Please check your connection and try again.',
    icon: '📡',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service is busy',
    message: 'We are having trouble finding sneakers right now. Please try again in a moment.',
    icon: '🛠️',
  },
  UNKNOWN_ERROR: {
    title: 'Something went wrong',
    message: 'Something went wrong. Please try again.',
    icon: '😕',
  },
}

export function getErrorMessage(code: string | null | undefined): ErrorMessage {
  if (!code || !(code in ERROR_MESSAGES)) {
    return ERROR_MESSAGES.UNKNOWN_ERROR
  }
  return ERROR_MESSAGES[code as ErrorCode]
}
