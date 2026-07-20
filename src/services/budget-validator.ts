import { BUDGET_RANGES, type BudgetRange } from '../shared/types/budget'

export type BudgetValidationResult = {
  validatedBudget: BudgetRange | null
  isValid: boolean
  validationErrors: string[]
}

export type BudgetValidatorConfig = {
  defaultBudget: BudgetRange
  maxAllowedValue: number
  openEndedMaxSentinel: number
  openEndedMinThreshold: number
}

const DEFAULT_CONFIG: BudgetValidatorConfig = {
  defaultBudget: { min: 50, max: 150 },
  maxAllowedValue: 999999,
  openEndedMaxSentinel: 999999,
  openEndedMinThreshold: 150,
}

/**
 * Validates and normalizes client budget payloads for the recommend pipeline.
 * Stateless — safe to reuse across serverless invocations.
 */
export class BudgetValidator {
  private readonly config: BudgetValidatorConfig

  constructor(config: Partial<BudgetValidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  validate(rawBudget: unknown): BudgetValidationResult {
    if (rawBudget === null || rawBudget === undefined) {
      return {
        validatedBudget: { ...this.config.defaultBudget },
        isValid: true,
        validationErrors: [],
      }
    }

    if (typeof rawBudget !== 'object') {
      return {
        validatedBudget: null,
        isValid: false,
        validationErrors: ['Budget must be an object with numeric min and max fields.'],
      }
    }

    const candidate = rawBudget as Record<string, unknown>
    const { min, max } = candidate

    if (typeof min !== 'number' || typeof max !== 'number' || Number.isNaN(min) || Number.isNaN(max)) {
      return {
        validatedBudget: null,
        isValid: false,
        validationErrors: ['Budget min and max must be numbers.'],
      }
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return {
        validatedBudget: null,
        isValid: false,
        validationErrors: ['Budget min and max must be finite numbers.'],
      }
    }

    if (min < 0 || max < 0) {
      return {
        validatedBudget: null,
        isValid: false,
        validationErrors: ['Budget min and max must be non-negative.'],
      }
    }

    if (min > max) {
      return {
        validatedBudget: null,
        isValid: false,
        validationErrors: ['Budget min must be less than or equal to max.'],
      }
    }

    const normalized: BudgetRange = {
      min,
      max: this.normalizeMax(min, max),
    }

    if (normalized.max > this.config.maxAllowedValue) {
      return {
        validatedBudget: null,
        isValid: false,
        validationErrors: [
          `Budget max must be less than or equal to ${this.config.maxAllowedValue}.`,
        ],
      }
    }

    return {
      validatedBudget: normalized,
      isValid: true,
      validationErrors: [],
    }
  }

  /** Exposes predefined UI ranges for callers/tests. */
  getPredefinedRanges(): readonly BudgetRange[] {
    return BUDGET_RANGES
  }

  private normalizeMax(min: number, max: number): number {
    if (min >= this.config.openEndedMinThreshold) {
      if (
        max === Number.MAX_SAFE_INTEGER ||
        max >= this.config.openEndedMaxSentinel ||
        max > 10_000
      ) {
        return this.config.openEndedMaxSentinel
      }
    }

    return max
  }
}
