/**
 * WO-150: client perf runner contract.
 * Full browser timing runs via scripts/run-perf-client.mjs.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'scripts', 'run-perf-client.mjs'),
  'utf8',
)

describe('run-perf-client budgets', () => {
  it('encodes the 6s submit-to-results NFR', () => {
    expect(source).toMatch(/RENDER_BUDGET_MS\s*=\s*6000/)
  })

  it('encodes the 100ms filter interaction NFR', () => {
    expect(source).toMatch(/FILTER_BUDGET_MS\s*=\s*100/)
  })

  it('uses Playwright library API with a local preview server', () => {
    expect(source).toContain("import { chromium } from 'playwright'")
    expect(source).toContain("import { preview } from 'vite'")
    expect(source).toContain("port: 4174")
  })

  it('fails clearly when dist/ or Chromium is missing', () => {
    expect(source).toContain("dist/ missing")
    expect(source).toContain('Chromium not found')
    expect(source).toContain('process.exit(1)')
  })
})
