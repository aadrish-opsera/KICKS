import type { AxeResults, Result } from 'axe-core'

/** WCAG 2.1 AA focused axe configuration helpers. */
export const AXE_WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

export function isBlockingViolation(violation: Result): boolean {
  return violation.impact === 'critical' || violation.impact === 'serious'
}

export function getBlockingViolations(results: AxeResults): Result[] {
  return results.violations.filter(isBlockingViolation)
}
