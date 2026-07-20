import { describe, expect, it, vi } from 'vitest'
import {
  CircuitBreaker,
  CircuitBreakerOpenError,
  SneakerApiUnavailableError,
} from '../circuit-breaker'

describe('CircuitBreaker', () => {
  it('trips after 3 consecutive failures and opens', () => {
    const onTransition = vi.fn()
    const breaker = new CircuitBreaker({ failureThreshold: 3, onTransition })

    breaker.recordFailure()
    breaker.recordFailure()
    expect(breaker.getState()).toBe('CLOSED')
    breaker.recordFailure()
    expect(breaker.getState()).toBe('OPEN')
    expect(onTransition).toHaveBeenCalledWith(
      expect.objectContaining({ next: 'OPEN', reason: 'consecutive_failures' }),
    )
  })

  it('blocks calls while OPEN and transitions to HALF_OPEN after cooldown', () => {
    let now = 0
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      openDurationMs: 30,
      now: () => now,
    })

    breaker.recordFailure()
    expect(() => breaker.beforeCall()).toThrow(CircuitBreakerOpenError)

    now = 31
    expect(breaker.getState()).toBe('HALF_OPEN')
    breaker.recordSuccess()
    expect(breaker.getState()).toBe('CLOSED')
  })

  it('exposes SneakerApiUnavailableError for dual-source failure', () => {
    expect(new SneakerApiUnavailableError().code).toBe('SNEAKER_API_UNAVAILABLE')
  })
})
