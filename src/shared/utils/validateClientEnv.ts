export type ClientEnv = {
  VITE_SENTRY_DSN?: string
  VITE_VERCEL_ANALYTICS_ID?: string
}

const PLACEHOLDER_PATTERN = /^<your-.*>$/i

function isMissing(value: string | undefined): boolean {
  if (value === undefined) {
    return true
  }

  const trimmed = value.trim()
  return trimmed === '' || PLACEHOLDER_PATTERN.test(trimmed)
}

type ClientEnvSource = {
  VITE_SENTRY_DSN?: string
  VITE_VERCEL_ANALYTICS_ID?: string
}

/**
 * Client-side env checks. Warns (does not throw) so the UI can still load.
 */
export function validateClientEnv(
  env: ClientEnvSource = import.meta.env as ClientEnvSource,
): ClientEnv {
  const result: ClientEnv = {}

  if (isMissing(env.VITE_SENTRY_DSN)) {
    console.warn(
      '[env] VITE_SENTRY_DSN is missing — frontend Sentry error tracking is disabled.',
    )
  } else {
    result.VITE_SENTRY_DSN = env.VITE_SENTRY_DSN!.trim()
  }

  if (isMissing(env.VITE_VERCEL_ANALYTICS_ID)) {
    console.warn(
      '[env] Optional VITE_VERCEL_ANALYTICS_ID is missing — Web Vitals analytics will be skipped.',
    )
  } else {
    result.VITE_VERCEL_ANALYTICS_ID = env.VITE_VERCEL_ANALYTICS_ID!.trim()
  }

  return result
}
