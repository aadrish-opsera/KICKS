import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { BudgetValidator } from '../src/services/budget-validator'
import { DegradedRanker } from '../src/services/degraded-ranker'
import {
  GeminiService,
  QuotaExhaustedError,
  type IGeminiService,
} from '../src/services/gemini-service'
import { GracefulDegradation } from '../src/services/graceful-degradation'
import { InputSanitizer } from '../src/services/input-sanitizer'
import type { ISneakerDataSource } from '../src/services/sneaker-data-source'
import { SneakerService } from '../src/services/sneaker-service'
import { SneaksFallbackService } from '../src/services/sneaks-fallback-service'
import type { ErrorResponse } from '../src/shared/types/error'
import type { RecommendationResponse } from '../src/shared/types/recommendation'
import type { Sneaker } from '../src/shared/types/sneaker'

export type RecommendLogger = {
  info: (log: Record<string, unknown>) => void
  error: (log: Record<string, unknown>) => void
}

export type RecommendHandlerDeps = {
  sanitizer: InputSanitizer
  budgetValidator: BudgetValidator
  sneakerService: ISneakerDataSource
  sneaksFallbackService: ISneakerDataSource
  geminiService: IGeminiService
  degradedRanker: DegradedRanker
  gracefulDegradation: GracefulDegradation
  logger: RecommendLogger
  now: () => number
  createRequestId: () => string
  hardTimeoutMs: number
  geminiMinRemainingMs: number
}

const defaultLogger: RecommendLogger = {
  info: (log) => console.info(JSON.stringify(log)),
  error: (log) => console.error(JSON.stringify(log)),
}

export function createRecommendHandler(deps: Partial<RecommendHandlerDeps> = {}) {
  const config: RecommendHandlerDeps = {
    sanitizer: new InputSanitizer(),
    budgetValidator: new BudgetValidator(),
    sneakerService: new SneakerService(),
    sneaksFallbackService: new SneaksFallbackService(),
    geminiService: new GeminiService(),
    degradedRanker: new DegradedRanker(),
    gracefulDegradation: new GracefulDegradation(),
    logger: defaultLogger,
    now: () => Date.now(),
    createRequestId: () => randomUUID(),
    hardTimeoutMs: 9000,
    geminiMinRemainingMs: 2000,
    ...deps,
  }

  return async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    const startedAt = config.now()
    const requestId = config.createRequestId()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Request-Id', requestId)

    if (req.method !== 'POST') {
      sendError(res, 405, {
        error: true,
        code: 'INVALID_INPUT',
        message: 'Method not allowed. Use POST.',
      })
      return
    }

    let sneakerApiSource = 'none'
    let geminiStatus = 'skipped'
    const retryCount = 0

    try {
      const body = parseBody(req.body)
      const preferencesRaw =
        typeof body.preferences === 'string' ? body.preferences : ''
      const sanitization = config.sanitizer.sanitize(preferencesRaw)
      const budgetValidation = config.budgetValidator.validate(body.budget)

      if (!sanitization.isValid || !budgetValidation.isValid || !budgetValidation.validatedBudget) {
        sendError(res, 400, {
          error: true,
          code: 'INVALID_INPUT',
          message:
            [...sanitization.validationErrors, ...budgetValidation.validationErrors].join(
              ' ',
            ) || 'Invalid recommendation request.',
        })
        return
      }

      guardTimeout(startedAt, config)

      let candidates: Sneaker[] = []
      try {
        candidates = await config.sneakerService.fetchSneakers({
          preferences: sanitization.sanitizedText,
          budget: budgetValidation.validatedBudget,
        })
        sneakerApiSource = 'sneaker-db'
      } catch {
        try {
          candidates = await config.sneaksFallbackService.fetchSneakers({
            preferences: sanitization.sanitizedText,
            budget: budgetValidation.validatedBudget,
          })
          sneakerApiSource = 'sneaks-api'
        } catch {
          config.logger.error({
            requestId,
            totalLatencyMs: config.now() - startedAt,
            sneakerApiSource,
            geminiStatus,
            retryCount,
            message: 'Both sneaker data sources failed',
          })
          sendError(res, 503, {
            error: true,
            code: 'SNEAKER_API_ERROR',
            message: 'Sneaker data is temporarily unavailable.',
          })
          return
        }
      }

      if (candidates.length === 0) {
        sendError(res, 503, {
          error: true,
          code: 'SNEAKER_API_ERROR',
          message: 'No sneakers matched the request.',
        })
        return
      }

      guardTimeout(startedAt, config)

      const elapsed = config.now() - startedAt
      const remaining = 10_000 - elapsed
      let ranked = candidates
      let aiRankingAvailable = false
      let geminiQuotaRemaining = -1
      let degradationReason: RecommendationResponse['degradationReason']
      let userMessage: string | undefined

      const skipReason = config.gracefulDegradation.shouldSkipGemini({
        canMakeRequest: true,
        elapsedMs: elapsed,
      })

      if (remaining >= config.geminiMinRemainingMs && skipReason === null) {
        try {
          const geminiResult = await config.geminiService.rankSneakers(
            sanitization.sanitizedText,
            budgetValidation.validatedBudget,
            candidates,
          )
          ranked = geminiResult.sneakers
          aiRankingAvailable = geminiResult.aiRankingAvailable
          geminiQuotaRemaining = geminiResult.quotaRemaining
          geminiStatus = geminiResult.aiRankingAvailable ? 'success' : 'degraded'
          if (!geminiResult.aiRankingAvailable) {
            degradationReason = 'gemini_error'
            userMessage =
              'AI-powered explanations are temporarily unavailable. Results are sorted by price match to your budget.'
          }
        } catch (error) {
          const reason =
            error instanceof QuotaExhaustedError ? 'quota_exhausted' : 'gemini_error'
          geminiStatus = reason
          const degraded = config.gracefulDegradation.rank(
            budgetValidation.validatedBudget,
            candidates,
            reason,
          )
          ranked = degraded.sneakers
          aiRankingAvailable = false
          degradationReason = degraded.degradationReason
          userMessage = degraded.userMessage
        }
      } else {
        const reason = skipReason ?? 'timeout_guard'
        geminiStatus = reason
        const degraded = config.gracefulDegradation.rank(
          budgetValidation.validatedBudget,
          candidates,
          reason,
        )
        ranked = degraded.sneakers
        aiRankingAvailable = false
        degradationReason = degraded.degradationReason
        userMessage = degraded.userMessage
      }

      const responseBody: RecommendationResponse = {
        sneakers: ranked.slice(0, 5),
        aiRankingAvailable,
        geminiQuotaRemaining,
        queryTime: config.now() - startedAt,
        sneakerApiSource,
        ...(degradationReason ? { degradationReason, userMessage } : {}),
      }

      config.logger.info({
        requestId,
        totalLatencyMs: responseBody.queryTime,
        sneakerApiSource,
        geminiStatus,
        retryCount,
      })

      res.status(200).json(responseBody)
    } catch (error) {
      if (error instanceof TimeoutGuardError) {
        config.logger.error({
          requestId,
          totalLatencyMs: config.now() - startedAt,
          sneakerApiSource,
          geminiStatus: 'timeout',
          retryCount,
        })
        sendError(res, 504, {
          error: true,
          code: 'TIMEOUT',
          message: 'Recommendation request timed out.',
        })
        return
      }

      config.logger.error({
        requestId,
        totalLatencyMs: config.now() - startedAt,
        sneakerApiSource,
        geminiStatus,
        retryCount,
        message: error instanceof Error ? error.message : 'Unhandled error',
      })
      sendError(res, 500, {
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Recommendation failed.',
      })
    }
  }
}

class TimeoutGuardError extends Error {
  constructor() {
    super('Timeout guard triggered')
    this.name = 'TimeoutGuardError'
  }
}

function guardTimeout(
  startedAt: number,
  config: RecommendHandlerDeps,
): void {
  if (config.now() - startedAt >= config.hardTimeoutMs) {
    throw new TimeoutGuardError()
  }
}

function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  if (body && typeof body === 'object') {
    return body as Record<string, unknown>
  }
  return {}
}

function sendError(res: VercelResponse, status: number, body: ErrorResponse): void {
  res.status(status).json(body)
}

export default createRecommendHandler()
