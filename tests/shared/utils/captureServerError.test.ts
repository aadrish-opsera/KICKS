import { beforeEach, describe, expect, it, vi } from 'vitest'

const { captureExceptionMock, withScopeMock, initMock } = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(() => 'event-id-1'),
  withScopeMock: vi.fn(),
  initMock: vi.fn(),
}))

vi.mock('@sentry/node', () => ({
  init: initMock,
  withScope: withScopeMock,
  captureException: captureExceptionMock,
}))

describe('captureServerError', () => {
  beforeEach(() => {
    vi.resetModules()
    captureExceptionMock.mockClear()
    withScopeMock.mockClear()
    initMock.mockClear()
    process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0'
  })

  it('sets endpoint/errorType tags and requestId extra before capture', async () => {
    const setTag = vi.fn()
    const setExtra = vi.fn()

    withScopeMock.mockImplementation((callback: (scope: unknown) => unknown) => {
      return callback({ setTag, setExtra })
    })

    const { captureServerError } = await import(
      '../../../src/shared/utils/captureServerError'
    )

    const eventId = captureServerError(new Error('boom'), {
      endpoint: '/api/health',
      requestId: 'req-123',
      errorType: 'INTERNAL_ERROR',
    })

    expect(eventId).toBe('event-id-1')
    expect(setTag).toHaveBeenCalledWith('endpoint', '/api/health')
    expect(setTag).toHaveBeenCalledWith('errorType', 'INTERNAL_ERROR')
    expect(setExtra).toHaveBeenCalledWith('requestId', 'req-123')
    expect(captureExceptionMock).toHaveBeenCalled()
  })

  it('does not throw when SENTRY_DSN is missing', async () => {
    delete process.env.SENTRY_DSN

    withScopeMock.mockImplementation((callback: (scope: unknown) => unknown) => {
      return callback({ setTag: vi.fn(), setExtra: vi.fn() })
    })

    const { captureServerError } = await import(
      '../../../src/shared/utils/captureServerError'
    )

    expect(() =>
      captureServerError(new Error('boom'), {
        endpoint: '/api/health',
        requestId: 'req-456',
        errorType: 'INTERNAL_ERROR',
      }),
    ).not.toThrow()
  })
})
