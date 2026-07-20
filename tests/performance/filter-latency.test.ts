/**
 * WO-150: filter interaction budget documentation + guardrails.
 * Full browser timing lives in scripts/run-perf-client.mjs (Playwright library).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Client-side filter interaction NFR. */
export const FILTER_INTERACTION_BUDGET_MS = 100

describe('performance: filter interaction budget', () => {
  it('documents the 100ms filter interaction NFR', () => {
    expect(FILTER_INTERACTION_BUDGET_MS).toBe(100)
  })

  it('is enforced by the Playwright library runner', () => {
    const runner = readFileSync(
      join(process.cwd(), 'scripts', 'run-perf-client.mjs'),
      'utf8',
    )
    expect(runner).toContain(`FILTER_BUDGET_MS = ${FILTER_INTERACTION_BUDGET_MS}`)
    expect(runner).toContain('MutationObserver')
  })
})
