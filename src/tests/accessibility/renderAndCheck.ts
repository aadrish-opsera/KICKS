import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'
import { axe } from 'vitest-axe'
import { getBlockingViolations } from './setup'

export async function renderAndCheckA11y(
  ui: ReactElement,
  options?: RenderOptions,
): Promise<{ renderResult: RenderResult; blockingViolations: ReturnType<typeof getBlockingViolations> }> {
  const renderResult = render(ui, options)
  const results = await axe(renderResult.container)
  return {
    renderResult,
    blockingViolations: getBlockingViolations(results),
  }
}
