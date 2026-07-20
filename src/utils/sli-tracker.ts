export type SliRequestMetrics = {
  requestId: string
  sneakerApiLatencyMs: number
  sneakerApiSuccess: boolean
  geminiLatencyMs: number
  geminiSuccess: boolean
  totalLatencyMs: number
  geminiQuotaUsed: number
  degraded: boolean
  degradationReason?: string
}

export type SliSummary = {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  successRate: number
  averageLatencyMs: number
  geminiQuotaUsed: number
}

export type SliTrackerConfig = {
  logger?: {
    info: (fields: Record<string, unknown>) => void
    warn: (fields: Record<string, unknown>) => void
  }
  now: () => Date
}

/**
 * Per-instance SLI tracker for offline analysis via structured logs.
 * Cold start resets counters — accepted serverless limitation.
 */
export class SliTracker {
  private totalRequests = 0
  private successfulRequests = 0
  private failedRequests = 0
  private totalLatencySum = 0
  private geminiQuotaUsed = 0
  private readonly config: SliTrackerConfig

  constructor(config: Partial<SliTrackerConfig> = {}) {
    this.config = {
      now: () => new Date(),
      ...config,
    }
  }

  record(metrics: SliRequestMetrics): void {
    this.totalRequests += 1
    this.totalLatencySum += metrics.totalLatencyMs
    this.geminiQuotaUsed += metrics.geminiQuotaUsed

    const success = metrics.sneakerApiSuccess && (metrics.degraded || metrics.geminiSuccess)
    if (success) {
      this.successfulRequests += 1
    } else {
      this.failedRequests += 1
    }

    this.config.logger?.info({
      messageType: 'sli_metric',
      timestamp: this.config.now().toISOString(),
      ...metrics,
    })

    const summary = this.getSummary()
    if (summary.totalRequests >= 5 && summary.successRate < 0.9) {
      this.config.logger?.warn({
        message: 'Sneaker API success rate dropped below 90%',
        successRate: summary.successRate,
      })
    }
    if (summary.totalRequests >= 5 && summary.averageLatencyMs > 5000) {
      this.config.logger?.warn({
        message: 'Average latency exceeded 5 seconds',
        averageLatencyMs: summary.averageLatencyMs,
      })
    }
  }

  getSummary(): SliSummary {
    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      successRate:
        this.totalRequests === 0 ? 1 : this.successfulRequests / this.totalRequests,
      averageLatencyMs:
        this.totalRequests === 0 ? 0 : this.totalLatencySum / this.totalRequests,
      geminiQuotaUsed: this.geminiQuotaUsed,
    }
  }
}
