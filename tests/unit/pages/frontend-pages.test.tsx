import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ComparisonProvider } from '../../../src/context/ComparisonContext'
import HomePage from '../../../src/pages/HomePage/HomePage'
import ResultsPage from '../../../src/pages/ResultsPage/ResultsPage'
import ComparisonPage from '../../../src/pages/ComparisonPage/ComparisonPage'
import { successResponse } from '../../../src/test-fixtures/apiResponseFixtures'
import { renderWithProviders } from '../../utils/render'

vi.mock('../../../src/hooks/useRecommendation', () => ({
  useRecommendation: () => ({
    data: null,
    error: null,
    isLoading: false,
    submit: vi.fn(),
    retry: vi.fn(),
  }),
}))

describe('Frontend page suite (WO-148)', () => {
  it('HomePage renders preference and budget controls', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /find my sneakers/i })).toBeDisabled()
  })

  it('ResultsPage renders sneaker cards from recommendation state', () => {
    render(
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
    expect(screen.getAllByRole('article').length).toBeGreaterThanOrEqual(5)
  })

  it('ComparisonPage shows empty guidance when nothing is selected', () => {
    renderWithProviders(<ComparisonPage />, { route: '/comparison' })
    expect(screen.getByRole('status')).toHaveTextContent(/no sneakers selected/i)
  })
})
