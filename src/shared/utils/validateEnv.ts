export type ServerEnv = {
  /** AI ranking provider key (Groq). Legacy GEMINI_API_KEY is accepted as fallback. */
  GROQ_API_KEY: string
  SENTRY_DSN: string
  SNEAKER_DB_API_KEY?: string
}

const PLACEHOLDER_PATTERN = /^<your-.*>$/i

function isMissing(value: string | undefined): boolean {
  if (value === undefined) {
    return true
  }

  const trimmed = value.trim()
  return trimmed === '' || PLACEHOLDER_PATTERN.test(trimmed)
}

function resolveAiApiKey(env: NodeJS.ProcessEnv): string | undefined {
  if (!isMissing(env.GROQ_API_KEY)) {
    return env.GROQ_API_KEY!.trim()
  }
  if (!isMissing(env.GEMINI_API_KEY)) {
    return env.GEMINI_API_KEY!.trim()
  }
  return undefined
}

/**
 * Fail-fast validation for serverless / Node process.env.
 * Throws when required server variables are missing or still placeholders.
 */
export function validateServerEnv(
  env: NodeJS.ProcessEnv = process.env,
): ServerEnv {
  const missingRequired: string[] = []
  const aiKey = resolveAiApiKey(env)

  if (!aiKey) {
    missingRequired.push('GROQ_API_KEY')
  }

  if (isMissing(env.SENTRY_DSN)) {
    missingRequired.push('SENTRY_DSN')
  }

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required server environment variables: ${missingRequired.join(', ')}. Copy .env.example to .env.local and fill in real values (or set them in the Vercel dashboard).`,
    )
  }

  if (isMissing(env.SNEAKER_DB_API_KEY)) {
    console.warn(
      '[env] Optional SNEAKER_DB_API_KEY is missing — sneaker API probes may report down until it is set.',
    )
  }

  const result: ServerEnv = {
    GROQ_API_KEY: aiKey!,
    SENTRY_DSN: env.SENTRY_DSN!.trim(),
  }

  if (!isMissing(env.SNEAKER_DB_API_KEY)) {
    result.SNEAKER_DB_API_KEY = env.SNEAKER_DB_API_KEY!.trim()
  }

  return result
}
