import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ComparisonProvider } from '../../context/ComparisonContext'
import { degradedResponse, successResponse } from '../../test-fixtures/apiResponseFixtures'
import { BANNER_MESSAGE } from '../../components/QuotaBanner/QuotaBanner'
import ResultsPage from './ResultsPage'

function renderWithState(state: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/results', state }]}>
      <ComparisonProvider>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/comparison" element={<div>Comparison</div>} />
        </Routes>
      </ComparisonProvider>
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

  it('enforces a max of three comparison selections and navigates', async () => {
    const user = userEvent.setup()
    renderWithState({ recommendation: successResponse })
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0]!)
    await user.click(checkboxes[1]!)
    expect(screen.getByRole('button', { name: /compare 2 sneakers/i })).toBeEnabled()
    await user.click(checkboxes[2]!)
    expect(screen.getByRole('button', { name: /compare 3 sneakers/i })).toBeEnabled()
    await user.click(checkboxes[3]!)
    expect(screen.getByText(/deselect one sneaker/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /compare 3 sneakers/i }))
    expect(screen.getByText('Comparison')).toBeInTheDocument()
  })

  it('filters by brand and shows empty state', async () => {
    const user = userEvent.setup()
    renderWithState({ recommendation: successResponse })
    await user.click(screen.getByRole('button', { name: 'Converse' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Nike' }))
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
  })

  it('opens detail modal from View Details', async () => {
    const user = userEvent.setup()
    renderWithState({ recommendation: successResponse })
    await user.click(screen.getAllByRole('button', { name: /view details/i })[0]!)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
