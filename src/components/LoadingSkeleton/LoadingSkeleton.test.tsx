import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoadingSkeleton from './LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('renders five skeleton cards by default', () => {
    const { container } = render(<LoadingSkeleton />)
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5)
  })

  it('respects custom count', () => {
    const { container } = render(<LoadingSkeleton count={3} />)
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3)
  })

  it('announces loading via aria-live region', () => {
    render(<LoadingSkeleton />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent(/loading sneaker recommendations/i)
  })

  it('contains no interactive elements', () => {
    const { container } = render(<LoadingSkeleton />)
    expect(container.querySelectorAll('button, a, input, select, textarea')).toHaveLength(0)
  })

  it('applies shimmer animation class', () => {
    const { container } = render(<LoadingSkeleton count={1} />)
    expect(container.querySelectorAll('[class*="shimmer"]').length).toBeGreaterThan(0)
  })
})
