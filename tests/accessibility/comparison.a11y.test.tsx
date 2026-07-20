import { useEffect, type ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  ComparisonProvider,
  useComparisonContext,
} from '../../src/context/ComparisonContext'
import ComparisonPage from '../../src/pages/ComparisonPage/ComparisonPage'
import { mockComparisonTwo } from '../fixtures/mockComparison'
import { renderAndCheckA11y } from '../../src/tests/accessibility/renderAndCheck'

function Seed(): ReactElement | null {
  const { setComparison } = useComparisonContext()
  useEffect(() => {
    setComparison(mockComparisonTwo, true)
  }, [setComparison])
  return null
}

describe('ComparisonPage accessibility', () => {
  it('has no critical or serious axe violations with comparison data', async () => {
    const { blockingViolations } = await renderAndCheckA11y(
      <MemoryRouter initialEntries={['/comparison']}>
        <ComparisonProvider>
          <Seed />
          <Routes>
            <Route path="/comparison" element={<ComparisonPage />} />
          </Routes>
        </ComparisonProvider>
      </MemoryRouter>,
    )
    expect(blockingViolations).toEqual([])
  })
})
