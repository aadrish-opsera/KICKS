import { afterEach, describe, expect, it, vi } from 'vitest'
import { StructuredLogger, type LogContext } from '../logger'

describe('StructuredLogger', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('emits JSON with timestamp, level, message, and context', () => {
    const lines: string[] = []
    const logger = new StructuredLogger({
      level: 'info',
      writeStdout: (line) => lines.push(line),
      now: () => new Date('2026-07-20T10:00:00.000Z'),
    })

    logger.info('hello', { module: 'recommend' })

    expect(lines).toHaveLength(1)
    const parsed = JSON.parse(lines[0]!) as {
      timestamp: string
      level: string
      message: string
      context: LogContext
    }
    expect(parsed).toEqual({
      timestamp: '2026-07-20T10:00:00.000Z',
      level: 'info',
      message: 'hello',
      context: { module: 'recommend' },
    })
  })

  it('filters levels using LOG_LEVEL / configured threshold', () => {
    const lines: string[] = []
    const logger = new StructuredLogger({
      level: 'warn',
      writeStdout: (line) => lines.push(line),
      writeStderr: (line) => lines.push(line),
    })

    logger.debug('d')
    logger.info('i')
    logger.warn('w')
    logger.error('e')

    expect(lines).toHaveLength(2)
    expect(JSON.parse(lines[0]!).level).toBe('warn')
    expect(JSON.parse(lines[1]!).level).toBe('error')
  })

  it('defaults to info when LOG_LEVEL is unset', () => {
    vi.stubEnv('LOG_LEVEL', '')
    const lines: string[] = []
    const logger = new StructuredLogger({
      writeStdout: (line) => lines.push(line),
      writeStderr: (line) => lines.push(line),
    })

    logger.debug('hidden')
    logger.info('visible')
    expect(lines).toHaveLength(1)
    expect(JSON.parse(lines[0]!).message).toBe('visible')
  })

  it('merges parent and child context', () => {
    const lines: string[] = []
    const parent = new StructuredLogger({
      level: 'info',
      context: { requestId: 'req-1' },
      writeStdout: (line) => lines.push(line),
    })
    const child = parent.child({ module: 'gemini' })
    child.info('scoped')

    expect(JSON.parse(lines[0]!).context).toEqual({
      requestId: 'req-1',
      module: 'gemini',
    })
  })

  it('handles circular references without throwing', () => {
    const lines: string[] = []
    const logger = new StructuredLogger({
      level: 'info',
      writeStdout: (line) => lines.push(line),
    })
    const circular: LogContext = { name: 'loop' }
    circular.self = circular

    expect(() => logger.info('circular', circular)).not.toThrow()
    expect(lines).toHaveLength(1)
    expect(JSON.parse(lines[0]!).context.self).toBe('[Circular]')
  })

  it('truncates oversized context string values', () => {
    const lines: string[] = []
    const logger = new StructuredLogger({
      level: 'info',
      writeStdout: (line) => lines.push(line),
    })
    const huge = 'x'.repeat(5000)
    logger.info('big', { payload: huge })

    const payload = JSON.parse(lines[0]!).context.payload as string
    expect(payload.length).toBeLessThan(huge.length)
    expect(payload.endsWith('…[truncated]')).toBe(true)
    expect(payload.startsWith('x'.repeat(1000))).toBe(true)
  })

  it('silently swallows stringify failures', () => {
    const lines: string[] = []
    const logger = new StructuredLogger({
      level: 'info',
      writeStdout: (line) => lines.push(line),
    })

    const boom = {
      toJSON() {
        throw new Error('cannot serialize')
      },
    }

    expect(() => logger.info('fail', { boom })).not.toThrow()
    expect(lines).toHaveLength(0)
  })
})
