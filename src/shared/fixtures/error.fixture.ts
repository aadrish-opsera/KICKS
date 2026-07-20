import type { ErrorResponse } from '../types/error'

export function createMockErrorResponse(
  overrides: Partial<ErrorResponse> = {},
): ErrorResponse {
  return {
    error: true,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
    ...overrides,
  }
}
