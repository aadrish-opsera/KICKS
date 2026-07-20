import type { QuotaStatus } from '../types/quota'

export function isQuotaStatus(value: unknown): value is QuotaStatus {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const status = value as Record<string, unknown>
  return (
    typeof status.remaining === 'number' &&
    typeof status.limit === 'number' &&
    typeof status.isExhausted === 'boolean' &&
    (typeof status.resetTime === 'string' || status.resetTime === null)
  )
}
