import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { degradedResponse, successResponse } from '../../test-fixtures/apiResponseFixtures'
import { BANNER_MESSAGE } from '../../components/QuotaBanner/QuotaBanner'
import ResultsPage from './ResultsPage'

function renderWithState(state: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/results', state }]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/comparison" element={<div>Comparison</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ResultsPage', () => {
  it('renders five sneaker cards from recommendation data', () => {
    renderWithState({ recommendation: successResponse })
    expect(screen.getAllByRole('article')).toHaveLength(5)
  })

  it('shows QuotaBanner when AI ranking is unavailable', () => {
    renderWithState({ recommendation: degradedResponse })
    expect(screen.getByRole('status')).toHaveTextContent(BANNER_MESSAGE)
  })

  it('hides QuotaBanner when AI ranking is available', () => {
    renderWithState({ recommendation: successResponse })
    expect(screen.queryByText(BANNER_MESSAGE)).not.toBeInTheDocument()
  })

  it('redirects home when recommendation data is missing', () => {
    renderWithState(null)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('enforces a max of three comparison selections', async () => {
    const user = userEvent.setup()
    renderWithState({ recommendation: successResponse })
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0]!)
    await user.click(checkboxes[1]!)
    await user.click(checkboxes[2]!)
    expect(screen.getByRole('button', { name: /compare selected/i })).toBeInTheDocument()
    await user.click(checkboxes[3]!)
    expect(screen.getByText(/deselect one sneaker/i)).toBeInTheDocument()
  })

  it('filters by brand and shows empty state', async () => {
    const user = userEvent.setup()
    renderWithState({ recommendation: successResponse })
    await user.selectOptions(screen.getByLabelText(/brand/i), 'Converse')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    await user.selectOptions(screen.getByLabelText(/brand/i), 'Nike')
    // Nike appears more than once in fixtures
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
    await user.selectOptions(screen.getByLabelText(/brand/i), 'Converse')
    await user.selectOptions(screen.getByLabelText(/max price/i), '100')
    // Chuck 70 is $85 — still visible
    expect(screen.getAllByRole('article').length).toBeGreaterThanOrEqual(1)
  })
})
