import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('audit-function-deps script (WO-151)', () => {
  const source = readFileSync(
    join(process.cwd(), 'scripts', 'audit-function-deps.mjs'),
    'utf8',
  )

  it('flags packages over 100KB for review', () => {
    expect(source).toMatch(/FLAG_BYTES\s*=\s*100\s*\*\s*1024/)
    expect(source).toContain('>100KB REVIEW')
  })

  it('audits serverless runtime deps only (not the full frontend tree)', () => {
    expect(source).toContain('SERVERLESS_RUNTIME_DEPS')
    expect(source).toContain('@sentry/node')
  })

  it('fails clearly when node_modules is missing', () => {
    expect(source).toContain('node_modules missing')
    expect(source).toContain('process.exit(1)')
  })
})
