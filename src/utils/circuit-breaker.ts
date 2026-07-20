export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export type CircuitBreakerConfig = {
  failureThreshold: number
  openDurationMs: number
  windowMs: number
  failureRateThreshold: number
  now: () => number
}

export class CircuitBreakerOpenError extends Error {
  readonly code = 'CIRCUIT_BREAKER_OPEN' as const

  constructor(message = 'Sneaker API circuit breaker is open') {
    super(message)
    this.name = 'CircuitBreakerOpenError'
  }
}

type AttemptRecord = {
  at: number
  success: boolean
}

/**
 * Circuit breaker with consecutive-failure and rolling failure-rate trips.
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private consecutiveFailures = 0
  private openedAt = 0
  private readonly attempts: AttemptRecord[] = []
  private readonly config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 2,
      openDurationMs: 30_000,
      windowMs: 30_000,
      failureRateThreshold: 0.5,
      now: () => Date.now(),
      ...config,
    }
  }

  getState(): CircuitState {
    this.maybeTransitionFromOpen()
    return this.state
  }

  beforeCall(): void {
    this.maybeTransitionFromOpen()
    if (this.state === 'OPEN') {
      throw new CircuitBreakerOpenError()
    }
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0
    this.recordAttempt(true)
    this.state = 'CLOSED'
  }

  recordFailure(): void {
    this.consecutiveFailures += 1
    this.recordAttempt(false)

    if (this.consecutiveFailures >= this.config.failureThreshold) {
      this.trip()
      return
    }

    if (
      this.attempts.length >= 4 &&
      this.failureRateInWindow() > this.config.failureRateThreshold
    ) {
      this.trip()
    }
  }

  private trip(): void {
    this.state = 'OPEN'
    this.openedAt = this.config.now()
  }

  private maybeTransitionFromOpen(): void {
    if (this.state !== 'OPEN') {
      return
    }

    if (this.config.now() - this.openedAt >= this.config.openDurationMs) {
      this.state = 'HALF_OPEN'
    }
  }

  private recordAttempt(success: boolean): void {
    const now = this.config.now()
    this.attempts.push({ at: now, success })
    const cutoff = now - this.config.windowMs
    while (this.attempts.length > 0 && this.attempts[0]!.at < cutoff) {
      this.attempts.shift()
    }
  }

  private failureRateInWindow(): number {
    if (this.attempts.length === 0) {
      return 0
    }
    const failures = this.attempts.filter((a) => !a.success).length
    return failures / this.attempts.length
  }
}
