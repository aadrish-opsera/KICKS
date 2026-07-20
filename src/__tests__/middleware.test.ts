import { describe, expect, it, beforeEach } from 'vitest'
import {
  RATE_LIMIT,
  WINDOW_MS,
  checkRateLimit,
  extractClientIp,
  resetRateLimitState,
} from '../edge/rateLimit'
import { createMockRequest } from '../test-utils/mock-request'

describe('edge rate limiting', () => {
  beforeEach(() => {
    resetRateLimitState()
  })

  it('extracts the first x-forwarded-for IP', () => {
    const request = createMockRequest({ ip: '1.2.3.4, 5.6.7.8' })
    expect(extractClientIp(request.headers)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip then unknown', () => {
    expect(extractClientIp(createMockRequest({ realIp: '9.9.9.9' }).headers)).toBe(
      '9.9.9.9',
    )
    expect(extractClientIp(createMockRequest({}).headers)).toBe('unknown')
  })

  it('allows up to RATE_LIMIT requests from one IP in the window', () => {
    const start = 1_000_000
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      expect(checkRateLimit('1.1.1.1', start + i).allowed).toBe(true)
    }
  })

  it('blocks the request after the limit and returns retryAfter', () => {
    const start = 2_000_000
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      checkRateLimit('2.2.2.2', start + i)
    }
    const blocked = checkRateLimit('2.2.2.2', start + RATE_LIMIT)
    expect(blocked.allowed).toBe(false)
    if (!blocked.allowed) {
      expect(blocked.retryAfter).toBeGreaterThan(0)
    }
  })

  it('tracks different IPs independently', () => {
    const start = 3_000_000
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      expect(checkRateLimit('a', start + i).allowed).toBe(true)
      expect(checkRateLimit('b', start + i).allowed).toBe(true)
    }
  })

  it('allows traffic again after the sliding window expires', () => {
    const start = 4_000_000
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      checkRateLimit('3.3.3.3', start + i)
    }
    expect(checkRateLimit('3.3.3.3', start + RATE_LIMIT).allowed).toBe(false)
    expect(checkRateLimit('3.3.3.3', start + WINDOW_MS + 1).allowed).toBe(true)
  })
})
