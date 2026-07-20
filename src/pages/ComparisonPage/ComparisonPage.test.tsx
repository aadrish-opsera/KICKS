import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  ComparisonProvider,
  useComparisonContext,
} from '../../context/ComparisonContext'
import { fiveSneakers } from '../../test-fixtures/sneakerFixtures'
import ComparisonPage from './ComparisonPage'
import type { ReactElement } from 'react'
import { useEffect } from 'react'

function SeedComparison({
  count,
}: {
  count: number
}): ReactElement | null {
  const { setComparison } = useComparisonContext()
  useEffect(() => {
    if (count > 0) {
      setComparison(fiveSneakers.slice(0, count), true)
    }
  }, [count, setComparison])
  return null
}

function renderPage(count: number) {
  return render(
    <MemoryRouter initialEntries={['/comparison']}>
      <ComparisonProvider>
        <SeedComparison count={count} />
        <Routes>
          <Route path="/results" element={<div>Results</div>} />
          <Route path="/comparison" element={<ComparisonPage />} />
        </Routes>
      </ComparisonProvider>
    </MemoryRouter>,
  )
}

describe('ComparisonPage', () => {
  it('shows empty state when fewer than 2 sneakers are selected', () => {
    renderPage(0)
    expect(screen.getByRole('status')).toHaveTextContent(/no sneakers selected/i)
    expect(screen.getByRole('link', { name: /back to results/i })).toBeInTheDocument()
  })

  it('renders comparison table for 2 sneakers', async () => {
    renderPage(2)
    expect(await screen.findByLabelText(/sneaker comparison table/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /compare your picks/i })).toBeInTheDocument()
  })

  it('renders comparison table for 3 sneakers', async () => {
    renderPage(3)
    expect(await screen.findByText(fiveSneakers[2]!.name)).toBeInTheDocument()
  })

  it('navigates back to results', async () => {
    const user = userEvent.setup()
    renderPage(2)
    await screen.findByLabelText(/sneaker comparison table/i)
    await user.click(screen.getByRole('button', { name: /back to results/i }))
    expect(screen.getByText('Results')).toBeInTheDocument()
  })
})
