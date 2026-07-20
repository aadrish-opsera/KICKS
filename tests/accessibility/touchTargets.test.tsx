import { useEffect, type ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Button from '../../src/components/shared/Button/Button'
import IconButton from '../../src/components/shared/IconButton/IconButton'
import {
  ComparisonProvider,
  useComparisonContext,
} from '../../src/context/ComparisonContext'
import HomePage from '../../src/pages/HomePage/HomePage'
import ResultsPage from '../../src/pages/ResultsPage/ResultsPage'
import ComparisonPage from '../../src/pages/ComparisonPage/ComparisonPage'
import { validateTouchTargets } from '../../src/tests/utils/touchTargetValidator'
import { mockComparisonTwo } from '../fixtures/mockComparison'
import { successResponse } from '../fixtures/mockSneakers'

function SeedComparison(): ReactElement | null {
  const { setComparison } = useComparisonContext()
  useEffect(() => {
    setComparison(mockComparisonTwo, true)
  }, [setComparison])
  return null
}

describe('touch target validation', () => {
  it('passes for shared Button and IconButton', () => {
    const { container } = render(
      <div>
        <Button>Find</Button>
        <IconButton ariaLabel="Close">×</IconButton>
      </div>,
    )
    const violations = validateTouchTargets(container).filter(
      (item) => item.width > 0 && item.height > 0,
    )
    expect(violations).toEqual([])
  })

  it('passes for HomePage interactive shell', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    const violations = validateTouchTargets(container).filter(
      (item) => item.width > 0 && item.height > 0,
    )
    expect(violations).toEqual([])
  })

  it('passes for ResultsPage interactive shell', () => {
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
    const violations = validateTouchTargets(container).filter(
      (item) => item.width > 0 && item.height > 0,
    )
    expect(violations).toEqual([])
  })

  it('passes for ComparisonPage interactive shell', async () => {
    const { container, findByLabelText } = render(
      <MemoryRouter initialEntries={['/comparison']}>
        <ComparisonProvider>
          <SeedComparison />
          <Routes>
            <Route path="/comparison" element={<ComparisonPage />} />
          </Routes>
        </ComparisonProvider>
      </MemoryRouter>,
    )
    await findByLabelText(/sneaker comparison table/i)
    const violations = validateTouchTargets(container).filter(
      (item) => item.width > 0 && item.height > 0,
    )
    expect(violations).toEqual([])
  })
})
