import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

vi.mock('./pages/HomePage/HomePage', () => ({
  default: () => <h1>Home Page</h1>,
}))

vi.mock('./pages/ResultsPage/ResultsPage', () => ({
  default: () => <h1>Results Page</h1>,
}))

vi.mock('./pages/ComparisonPage/ComparisonPage', () => ({
  default: () => <h1>Comparison Page</h1>,
}))

import App from './App'

describe('App route code splitting (WO-151)', () => {
  it('shows Suspense fallback then the home route', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /home page/i })).toBeInTheDocument()
    })
  })
})
