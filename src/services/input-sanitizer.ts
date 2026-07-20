export type SanitizationResult = {
  sanitizedText: string
  isValid: boolean
  validationErrors: string[]
}

export type InputSanitizerConfig = {
  minLength: number
  maxLength: number
  promptInjectionPatterns: readonly RegExp[]
  sqlInjectionPatterns: readonly RegExp[]
  htmlTagPattern: RegExp
  eventHandlerPattern: RegExp
  dangerousUriPattern: RegExp
}

const DEFAULT_PROMPT_INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+previous\s+instructions/gi,
  /you\s+are\s+now\b/gi,
  /\bsystem\s*:/gi,
  /\bassistant\s*:/gi,
  /role[\s-]?play\s+as\b/gi,
  /```\s*system\b/gi,
  /\bdisregard\s+(all\s+)?(safety|previous|prior)\b/gi,
]

const DEFAULT_SQL_INJECTION_PATTERNS: readonly RegExp[] = [
  /\bunion\s+select\b/gi,
  /\bdrop\s+table\b/gi,
  /\bor\s+1\s*=\s*1\b/gi,
  /\bor\s+'1'\s*=\s*'1'/gi,
  /--+/g,
  /;+/g,
]

const DEFAULT_CONFIG: InputSanitizerConfig = {
  minLength: 3,
  maxLength: 500,
  promptInjectionPatterns: DEFAULT_PROMPT_INJECTION_PATTERNS,
  sqlInjectionPatterns: DEFAULT_SQL_INJECTION_PATTERNS,
  htmlTagPattern:
    /<\/?(?:script|img|iframe|object|embed|form|input|svg|a|link|style|meta)(?:\s[^>]*)?>/gi,
  eventHandlerPattern: /\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
  dangerousUriPattern: /(?:javascript|data|vbscript)\s*:/gi,
}

/**
 * Stateless preference-text sanitizer for the recommendation pipeline.
 * Never throws — all failures are returned as structured SanitizationResult values.
 */
export class InputSanitizer {
  private readonly config: InputSanitizerConfig

  constructor(config: Partial<InputSanitizerConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      promptInjectionPatterns:
        config.promptInjectionPatterns ?? DEFAULT_CONFIG.promptInjectionPatterns,
      sqlInjectionPatterns:
        config.sqlInjectionPatterns ?? DEFAULT_CONFIG.sqlInjectionPatterns,
    }
  }

  sanitize(rawInput: string): SanitizationResult {
    const validationErrors: string[] = []
    let text = rawInput.trim()

    if (text.length < this.config.minLength) {
      return {
        sanitizedText: text,
        isValid: false,
        validationErrors: [
          `Preferences must be at least ${this.config.minLength} characters after trimming.`,
        ],
      }
    }

    if (text.length > this.config.maxLength) {
      return {
        sanitizedText: text.slice(0, this.config.maxLength),
        isValid: false,
        validationErrors: [
          `Preferences must be at most ${this.config.maxLength} characters.`,
        ],
      }
    }

    text = this.stripHtmlTags(text)
    text = text.replace(this.config.eventHandlerPattern, '')
    text = text.replace(this.config.dangerousUriPattern, '')

    const withoutInjection = this.neutralizePromptInjection(text)
    if (withoutInjection.detected) {
      validationErrors.push(
        'Prompt injection patterns were detected and removed from the preferences text.',
      )
      text = withoutInjection.text
    }

    text = this.stripSqlPatterns(text)
    text = text.replace(/\s+/g, ' ').trim()

    if (text.length < this.config.minLength) {
      validationErrors.push(
        `Preferences must be at least ${this.config.minLength} characters after sanitization.`,
      )
      return {
        sanitizedText: text,
        isValid: false,
        validationErrors,
      }
    }

    if (withoutInjection.detected) {
      return {
        sanitizedText: text,
        isValid: false,
        validationErrors,
      }
    }

    return {
      sanitizedText: text,
      isValid: true,
      validationErrors: [],
    }
  }

  private stripHtmlTags(input: string): string {
    let previous = ''
    let current = input
    let iterations = 0

    while (previous !== current && iterations < 10) {
      previous = current
      current = current.replace(this.config.htmlTagPattern, '')
      current = current.replace(/<\/?[a-z][^>]*>/gi, '')
      iterations += 1
    }

    return current
  }

  private neutralizePromptInjection(input: string): {
    text: string
    detected: boolean
  } {
    let text = input
    let detected = false

    for (const pattern of this.config.promptInjectionPatterns) {
      pattern.lastIndex = 0
      if (pattern.test(text)) {
        detected = true
        pattern.lastIndex = 0
        text = text.replace(pattern, ' ')
      }
    }

    return { text, detected }
  }

  private stripSqlPatterns(input: string): string {
    let text = input
    for (const pattern of this.config.sqlInjectionPatterns) {
      pattern.lastIndex = 0
      text = text.replace(pattern, ' ')
    }
    return text
  }
}
