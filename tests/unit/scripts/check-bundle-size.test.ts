/**
 * WO-150: bundle budget constants and script contract.
 * Full gzip enforcement runs via scripts/check-bundle-size.mjs after build.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const BUDGET_KIB = 200
const BUDGET_BYTES = BUDGET_KIB * 1024

describe('check-bundle-size budget', () => {
  it('encodes a 200 KiB gzipped JS budget in the script', () => {
    const source = readFileSync(
      join(process.cwd(), 'scripts', 'check-bundle-size.mjs'),
      'utf8',
    )
    expect(source).toMatch(/BUDGET_BYTES\s*=\s*200\s*\*\s*1024/)
    expect(BUDGET_BYTES).toBe(204_800)
  })

  it('requires dist/assets and exits non-zero when missing', () => {
    const source = readFileSync(
      join(process.cwd(), 'scripts', 'check-bundle-size.mjs'),
      'utf8',
    )
    expect(source).toContain("join(process.cwd(), 'dist', 'assets')")
    expect(source).toContain('process.exit(1)')
  })
})
