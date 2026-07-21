import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('check-function-size script (WO-151)', () => {
  const source = readFileSync(
    join(process.cwd(), 'scripts', 'check-function-size.mjs'),
    'utf8',
  )

  it('encodes a 5 MiB uncompressed budget', () => {
    expect(source).toMatch(/BUDGET_BYTES\s*=\s*5\s*\*\s*1024\s*\*\s*1024/)
  })

  it('measures api/ shared src and serverless runtime deps only', () => {
    expect(source).toContain("join(root, 'api')")
    expect(source).toContain('SERVERLESS_RUNTIME_DEPS')
    expect(source).toContain('@sentry/node')
    expect(source).toContain('process.exit(1)')
  })
})
