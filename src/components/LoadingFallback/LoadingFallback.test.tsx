import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoadingFallback from './LoadingFallback'

describe('LoadingFallback', () => {
  it('announces a friendly loading status', () => {
    render(<LoadingFallback />)
    expect(screen.getByRole('status')).toHaveTextContent(/loading page/i)
    expect(screen.getByText(/hang tight/i)).toBeInTheDocument()
  })
})
