/**
 * WO-150: client render budget documentation + guardrails.
 * Full browser timing lives in scripts/run-perf-client.mjs (Playwright library).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** End-to-end submit → results NFR (mocked API). */
export const CLIENT_RENDER_BUDGET_MS = 6000

describe('performance: client render budget', () => {
  it('documents the 6s submit-to-results NFR', () => {
    expect(CLIENT_RENDER_BUDGET_MS).toBe(6000)
  })

  it('is enforced by the Playwright library runner', () => {
    const runner = readFileSync(
      join(process.cwd(), 'scripts', 'run-perf-client.mjs'),
      'utf8',
    )
    expect(runner).toContain(`RENDER_BUDGET_MS = ${CLIENT_RENDER_BUDGET_MS}`)
    expect(runner).toContain('submit → results')
  })
})
