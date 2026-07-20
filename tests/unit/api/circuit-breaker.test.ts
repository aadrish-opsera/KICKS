import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CircuitBreaker,
  CircuitBreakerOpenError,
} from '../../../src/utils/circuit-breaker'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures')

describe('CircuitBreaker (WO-146)', () => {
  it('trips closed → open after 3 consecutive failures', () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3 })
    breaker.recordFailure()
    breaker.recordFailure()
    expect(breaker.getState()).toBe('CLOSED')
    breaker.recordFailure()
    expect(breaker.getState()).toBe('OPEN')
  })

  it('transitions open → half-open after cooldown, then closed on success', () => {
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

  it('re-opens when a half-open probe fails', () => {
    let now = 0
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      openDurationMs: 20,
      now: () => now,
    })
    breaker.recordFailure()
    now = 25
    expect(breaker.getState()).toBe('HALF_OPEN')
    breaker.recordFailure()
    expect(breaker.getState()).toBe('OPEN')
  })

  it('loads committed JSON fixtures for integration reuse', () => {
    const sneakerDb = JSON.parse(
      readFileSync(join(fixturesDir, 'sneaker-database-response.json'), 'utf8'),
    ) as unknown[]
    expect(sneakerDb).toHaveLength(10)
  })
})
