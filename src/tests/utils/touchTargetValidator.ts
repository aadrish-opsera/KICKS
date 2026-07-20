const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [role="checkbox"], [role="radio"], [role="slider"]'

export type TouchTargetViolation = {
  tag: string
  width: number
  height: number
}

/**
 * Asserts interactive elements meet the 44x44px minimum touch target.
 * Returns violations (empty when compliant).
 */
export function validateTouchTargets(container: ParentNode): TouchTargetViolation[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
  const violations: TouchTargetViolation[] = []

  for (const element of elements) {
    if (element.getAttribute('aria-hidden') === 'true') {
      continue
    }
    const width = element.offsetWidth
    const height = element.offsetHeight
    if (width > 0 && height > 0 && (width < 44 || height < 44)) {
      violations.push({
        tag: element.tagName.toLowerCase(),
        width,
        height,
      })
    }
  }

  return violations
}
