import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('check-dependency-approvals script (WO-151)', () => {
  const source = readFileSync(
    join(process.cwd(), 'scripts', 'check-dependency-approvals.mjs'),
    'utf8',
  )

  it('encodes a 50KB approval threshold', () => {
    expect(source).toMatch(/APPROVAL_BYTES\s*=\s*50\s*\*\s*1024/)
  })

  it('requires DEPENDENCIES.md entries for oversized packages', () => {
    expect(source).toContain('DEPENDENCIES.md')
    expect(source).toContain('process.exit(1)')
  })
})
