import type { ErrorEvent } from '@sentry/core'
import { describe, expect, it, vi } from 'vitest'
import { sanitizeSentryEvent } from '../../../src/shared/utils/sanitizeSentryEvent'

/** Fixture: event with secrets that beforeSend must strip. */
export const sensitiveSentryEventFixture: ErrorEvent = {
  type: undefined,
  request: {
    url: 'https://example.com/api/recommend',
    headers: {
      Authorization: 'Bearer secret-token',
      'X-Api-Key': 'AIzaSyDummyKeyValue1234567890',
      'Content-Type': 'application/json',
      'X-Custom-Key': 'should-be-removed',
    },
    data: {
      preferences: 'red running shoes under $100',
      budget: 100,
    },
    query_string: 'key=AIzaSyDummyKeyValue1234567890',
  },
  message: 'Failed with Bearer sk-abcdefghijklmnopqrstuv',
  extra: {
    apiKey: 'AIzaSyDummyKeyValue1234567890',
    safeNote: 'user-facing error',
  },
}

describe('sanitizeSentryEvent', () => {
  it('strips auth headers, request body, and API-key-like values', () => {
    const sanitized = sanitizeSentryEvent(
      structuredClone(sensitiveSentryEventFixture),
    )

    expect(sanitized).not.toBeNull()
    expect(sanitized?.request?.headers).toEqual({
      'Content-Type': 'application/json',
    })
    expect(sanitized?.request?.data).toBeUndefined()
    expect(sanitized?.request?.query_string).toBeUndefined()
    expect(sanitized?.message).toContain('[REDACTED]')
    expect(sanitized?.extra).toMatchObject({
      apiKey: '[REDACTED]',
      safeNote: 'user-facing error',
    })
  })
})

describe('initSentryClient', () => {
  it('does not throw when VITE_SENTRY_DSN is missing', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SENTRY_DSN', '')

    const { initSentryClient } = await import(
      '../../../src/shared/utils/sentryClientInit'
    )

    expect(() => initSentryClient()).not.toThrow()
    vi.unstubAllEnvs()
  })
})
