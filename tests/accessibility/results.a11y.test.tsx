import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ComparisonProvider } from '../../src/context/ComparisonContext'
import ResultsPage from '../../src/pages/ResultsPage/ResultsPage'
import { successResponse } from '../fixtures/mockSneakers'
import { renderAndCheckA11y } from '../../src/tests/accessibility/renderAndCheck'

describe('ResultsPage accessibility', () => {
  it('has no critical or serious axe violations with sneaker data', async () => {
    const { blockingViolations } = await renderAndCheckA11y(
      <MemoryRouter
        initialEntries={[{ pathname: '/results', state: { recommendation: successResponse } }]}
      >
        <ComparisonProvider>
          <Routes>
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </ComparisonProvider>
      </MemoryRouter>,
    )
    expect(blockingViolations).toEqual([])
  })
})
