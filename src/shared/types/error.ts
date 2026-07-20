/**
 * Known API error codes for structured client handling.
 */
export type ErrorCode =
  | 'INVALID_INPUT'
  | 'SNEAKER_API_ERROR'
  | 'GEMINI_API_ERROR'
  | 'GEMINI_QUOTA_EXHAUSTED'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR'

/** Standard error envelope returned by serverless handlers. */
export type ErrorResponse = {
  /** Always true for error responses. */
  error: true
  /** Machine-readable error classification. */
  code: ErrorCode
  /** Safe, user-facing message (never includes secrets or stack traces). */
  message: string
}
