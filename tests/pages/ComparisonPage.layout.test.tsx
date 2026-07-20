import { useEffect, type ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  ComparisonProvider,
  useComparisonContext,
} from '../../src/context/ComparisonContext'
import ComparisonPage from '../../src/pages/ComparisonPage/ComparisonPage'
import pageStyles from '../../src/pages/ComparisonPage/ComparisonPage.module.css'
import { mockComparisonTwo } from '../fixtures/mockComparison'

function Seed(): ReactElement | null {
  const { setComparison } = useComparisonContext()
  useEffect(() => {
    setComparison(mockComparisonTwo, true)
  }, [setComparison])
  return null
}

describe('ComparisonPage layout shell', () => {
  it('renders comparison region with overflow support and no horizontal page overflow', async () => {
    const { container, findByLabelText } = render(
      <MemoryRouter initialEntries={['/comparison']}>
        <ComparisonProvider>
          <Seed />
          <Routes>
            <Route path="/comparison" element={<ComparisonPage />} />
          </Routes>
        </ComparisonProvider>
      </MemoryRouter>,
    )

    await findByLabelText(/sneaker comparison table/i)
    expect(container.querySelector(`.${pageStyles.compareRegion}`)).toBeTruthy()
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      Math.max(document.documentElement.clientWidth, 320),
    )
  })
})
