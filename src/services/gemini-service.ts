import type { BudgetRange } from '../shared/types/budget'
import type { SneakerResult } from './sneaker-data-source'
import { DegradedRanker } from './degraded-ranker'
import { PromptConstructor } from './prompt-constructor'
import { QuotaTracker } from '../utils/quota-tracker'

export type GeminiRankResult = {
  sneakers: SneakerResult[]
  aiRankingAvailable: boolean
  tokensUsed: number
  quotaRemaining: number
}

export interface IGeminiService {
  rankSneakers(
    preferences: string,
    budget: BudgetRange,
    candidates: readonly SneakerResult[],
  ): Promise<GeminiRankResult>
}

export type GeminiGenerateFn = (input: {
  systemInstruction: string
  userPrompt: string
  apiKey: string
  signal: AbortSignal
}) => Promise<{ text: string; tokensUsed: number }>

export type GeminiServiceConfig = {
  apiKey?: string
  timeoutMs: number
  promptConstructor: PromptConstructor
  quotaTracker: QuotaTracker
  degradedRanker: DegradedRanker
  generate: GeminiGenerateFn
  logger: {
    info: (log: Record<string, unknown>) => void
    error: (log: Record<string, unknown>) => void
  }
}

export class QuotaExhaustedError extends Error {
  readonly code = 'GEMINI_QUOTA_EXHAUSTED' as const
  constructor(message = 'Gemini daily quota exhausted') {
    super(message)
    this.name = 'QuotaExhaustedError'
  }
}

export class GeminiApiError extends Error {
  readonly code = 'GEMINI_API_ERROR' as const
  constructor(message: string) {
    super(message)
    this.name = 'GeminiApiError'
  }
}

export class ContentSafetyError extends Error {
  readonly code = 'CONTENT_SAFETY' as const
  constructor(message = 'Gemini explanation failed content safety checks') {
    super(message)
    this.name = 'ContentSafetyError'
  }
}

const UNSAFE_TERMS = [
  'damn',
  'hell',
  'kill',
  'sexy',
  'nude',
  'drug',
  'alcohol',
  'weapon',
] as const

/**
 * Gemini ranking service with quota tracking and safety validation.
 * On parse/safety failures, falls back to DegradedRanker.
 */
export class GeminiService implements IGeminiService {
  private readonly config: GeminiServiceConfig

  constructor(config: Partial<GeminiServiceConfig> = {}) {
    this.config = {
      apiKey: process.env.GEMINI_API_KEY,
      timeoutMs: 5000,
      promptConstructor: new PromptConstructor(),
      quotaTracker: new QuotaTracker(),
      degradedRanker: new DegradedRanker(),
      generate: defaultGeminiGenerate,
      logger: {
        info: (log) => console.info(JSON.stringify(log)),
        error: (log) => console.error(JSON.stringify(log)),
      },
      ...config,
    }
  }

  async rankSneakers(
    preferences: string,
    budget: BudgetRange,
    candidates: readonly SneakerResult[],
  ): Promise<GeminiRankResult> {
    const startedAt = Date.now()

    if (!this.config.quotaTracker.check()) {
      throw new QuotaExhaustedError()
    }

    if (!this.config.apiKey) {
      throw new GeminiApiError('GEMINI_API_KEY is missing')
    }

    const prompt = this.config.promptConstructor.buildPrompt(
      preferences,
      budget,
      candidates,
    )

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const generated = await this.config.generate({
        systemInstruction: prompt.systemInstruction,
        userPrompt: prompt.userPrompt,
        apiKey: this.config.apiKey,
        signal: controller.signal,
      })

      this.config.quotaTracker.increment()
      const ranked = parseAndApplyRanking(generated.text, candidates)
      assertFamilyFriendly(ranked)

      const quotaRemaining = this.config.quotaTracker.remaining()
      this.config.logger.info({
        geminiLatencyMs: Date.now() - startedAt,
        geminiStatus: 'success',
        geminiTokensUsed: generated.tokensUsed,
        geminiQuotaRemaining: quotaRemaining,
      })

      return {
        sneakers: ranked,
        aiRankingAvailable: true,
        tokensUsed: generated.tokensUsed,
        quotaRemaining,
      }
    } catch (error) {
      if (error instanceof QuotaExhaustedError) {
        throw error
      }

      if (error instanceof ContentSafetyError || error instanceof GeminiApiError) {
        this.config.logger.error({
          geminiLatencyMs: Date.now() - startedAt,
          geminiStatus: error.name,
          geminiTokensUsed: 0,
          geminiQuotaRemaining: this.config.quotaTracker.remaining(),
          message: error.message,
        })
        return this.degraded(budget, candidates)
      }

      if (error instanceof Error && error.name === 'AbortError') {
        this.config.logger.error({
          geminiLatencyMs: Date.now() - startedAt,
          geminiStatus: 'timeout',
          geminiTokensUsed: 0,
          geminiQuotaRemaining: this.config.quotaTracker.remaining(),
        })
        return this.degraded(budget, candidates)
      }

      this.config.logger.error({
        geminiLatencyMs: Date.now() - startedAt,
        geminiStatus: 'error',
        geminiTokensUsed: 0,
        geminiQuotaRemaining: this.config.quotaTracker.remaining(),
        message: error instanceof Error ? error.message : 'Gemini failure',
      })
      return this.degraded(budget, candidates)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private degraded(
    budget: BudgetRange,
    candidates: readonly SneakerResult[],
  ): GeminiRankResult {
    const ranked = this.config.degradedRanker.rankByPriceRelevance(budget, candidates)
    return {
      sneakers: ranked.map(({ rank: _rank, ...sneaker }) => sneaker),
      aiRankingAvailable: false,
      tokensUsed: 0,
      quotaRemaining: this.config.quotaTracker.remaining(),
    }
  }
}

type GeminiRankItem = {
  rank: number
  sneakerId: string
  aiExplanation: string
  aiRating: number
}

function parseAndApplyRanking(
  text: string,
  candidates: readonly SneakerResult[],
): SneakerResult[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new GeminiApiError('Malformed Gemini JSON response')
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new GeminiApiError('Gemini response must be a non-empty array')
  }

  const byId = new Map(candidates.map((sneaker) => [sneaker.id, sneaker]))
  const ranked: SneakerResult[] = []

  for (const item of parsed) {
    if (!isGeminiRankItem(item)) {
      throw new GeminiApiError('Gemini response item failed schema validation')
    }
    const match = byId.get(item.sneakerId)
    if (!match) {
      throw new GeminiApiError(`Unknown sneakerId in Gemini response: ${item.sneakerId}`)
    }
    ranked.push({
      ...match,
      aiExplanation: item.aiExplanation,
      aiRating: item.aiRating,
    })
  }

  return ranked.slice(0, 5)
}

function isGeminiRankItem(value: unknown): value is GeminiRankItem {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as Record<string, unknown>
  return (
    typeof item.rank === 'number' &&
    typeof item.sneakerId === 'string' &&
    typeof item.aiExplanation === 'string' &&
    typeof item.aiRating === 'number' &&
    item.aiRating >= 1 &&
    item.aiRating <= 10
  )
}

function assertFamilyFriendly(sneakers: readonly SneakerResult[]): void {
  for (const sneaker of sneakers) {
    const explanation = (sneaker.aiExplanation ?? '').toLowerCase()
    if (UNSAFE_TERMS.some((term) => explanation.includes(term))) {
      throw new ContentSafetyError()
    }
  }
}

async function defaultGeminiGenerate(input: {
  systemInstruction: string
  userPrompt: string
  apiKey: string
  signal: AbortSignal
}): Promise<{ text: string; tokensUsed: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(input.apiKey)}`
  const response = await fetch(url, {
    method: 'POST',
    signal: input.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: input.systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: input.userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    throw new GeminiApiError(`Gemini API responded with ${response.status}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    usageMetadata?: { totalTokenCount?: number }
  }
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new GeminiApiError('Gemini API returned an empty response')
  }

  return {
    text,
    tokensUsed: payload.usageMetadata?.totalTokenCount ?? 0,
  }
}
