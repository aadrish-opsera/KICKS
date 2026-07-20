import { afterEach, describe, expect, it, vi } from 'vitest'
import { validateServerEnv } from '../../../src/shared/utils/validateEnv'
import { validateClientEnv } from '../../../src/shared/utils/validateClientEnv'

/** Fixture: all required server vars present. */
export const completeServerEnvFixture: NodeJS.ProcessEnv = {
  GROQ_API_KEY: 'test-groq-key',
  SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  SNEAKER_DB_API_KEY: 'test-sneaker-key',
}

/** Fixture: required server var missing. */
export const missingGeminiEnvFixture: NodeJS.ProcessEnv = {
  SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
}

describe('validateServerEnv', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns typed env when all required vars are present', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const result = validateServerEnv(completeServerEnvFixture)

    expect(result.GROQ_API_KEY).toBe('test-groq-key')
    expect(result.SENTRY_DSN).toContain('ingest.sentry.io')
    expect(result.SNEAKER_DB_API_KEY).toBe('test-sneaker-key')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('throws when a required variable is missing', () => {
    expect(() => validateServerEnv(missingGeminiEnvFixture)).toThrow(/GROQ_API_KEY/)
  })

  it('throws when a required variable is an empty string', () => {
    expect(() =>
      validateServerEnv({
        GROQ_API_KEY: '   ',
        SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      }),
    ).toThrow(/GROQ_API_KEY/)
  })

  it('throws when a required variable is still a placeholder', () => {
    expect(() =>
      validateServerEnv({
        GROQ_API_KEY: '<your-groq-api-key>',
        SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      }),
    ).toThrow(/GROQ_API_KEY/)
  })

  it('accepts legacy GEMINI_API_KEY as AI key fallback', () => {
    const result = validateServerEnv({
      GEMINI_API_KEY: 'legacy-gemini-key',
      SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      SNEAKER_DB_API_KEY: 'test-sneaker-key',
    })
    expect(result.GROQ_API_KEY).toBe('legacy-gemini-key')
  })

  it('warns when optional SNEAKER_DB_API_KEY is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const result = validateServerEnv({
      GROQ_API_KEY: 'test-groq-key',
      SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
    })

    expect(result.SNEAKER_DB_API_KEY).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('SNEAKER_DB_API_KEY'),
    )
  })
})

describe('validateClientEnv', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns present client vars and does not throw when optional is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const result = validateClientEnv({
      VITE_SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
    })

    expect(result.VITE_SENTRY_DSN).toContain('ingest.sentry.io')
    expect(result.VITE_VERCEL_ANALYTICS_ID).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('VITE_VERCEL_ANALYTICS_ID'),
    )
  })

  it('warns (does not throw) when VITE_SENTRY_DSN is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(() => validateClientEnv({})).not.toThrow()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('VITE_SENTRY_DSN'),
    )
  })
})
