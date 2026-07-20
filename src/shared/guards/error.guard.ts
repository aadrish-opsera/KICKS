import type { ErrorCode, ErrorResponse } from '../types/error'

const ERROR_CODES: ReadonlySet<ErrorCode> = new Set([
  'INVALID_INPUT',
  'SNEAKER_API_ERROR',
  'GEMINI_API_ERROR',
  'GEMINI_QUOTA_EXHAUSTED',
  'TIMEOUT',
  'INTERNAL_ERROR',
])

export function isErrorResponse(value: unknown): value is ErrorResponse {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const response = value as Record<string, unknown>
  return (
    response.error === true &&
    typeof response.code === 'string' &&
    ERROR_CODES.has(response.code as ErrorCode) &&
    typeof response.message === 'string'
  )
}
