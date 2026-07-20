import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ComparisonProvider } from '../../src/context/ComparisonContext'
import ResultsPage from '../../src/pages/ResultsPage/ResultsPage'
import pageStyles from '../../src/pages/ResultsPage/ResultsPage.module.css'
import { successResponse } from '../fixtures/mockSneakers'

describe('ResultsPage layout shell', () => {
  it('uses a single-column grid that upgrades to 2 columns at desktop', () => {
    const { container } = render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/results', state: { recommendation: successResponse } },
        ]}
      >
        <ComparisonProvider>
          <Routes>
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </ComparisonProvider>
      </MemoryRouter>,
    )

    expect(container.querySelector(`.${pageStyles.grid}`)).toBeTruthy()
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      Math.max(document.documentElement.clientWidth, 320),
    )
  })
})
