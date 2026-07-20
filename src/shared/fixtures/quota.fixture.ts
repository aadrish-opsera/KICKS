import type { QuotaStatus } from '../types/quota'

export function createMockQuotaStatus(
  overrides: Partial<QuotaStatus> = {},
): QuotaStatus {
  return {
    remaining: 100,
    limit: 250,
    isExhausted: false,
    resetTime: '2026-07-21T00:00:00.000Z',
    ...overrides,
  }
}
