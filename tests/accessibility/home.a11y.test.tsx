import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HomePage from '../../src/pages/HomePage/HomePage'
import { renderAndCheckA11y } from '../../src/tests/accessibility/renderAndCheck'

describe('HomePage accessibility', () => {
  it('has no critical or serious axe violations', async () => {
    const { blockingViolations } = await renderAndCheckA11y(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(blockingViolations).toEqual([])
  })
})
