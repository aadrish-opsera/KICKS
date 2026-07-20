import { render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import ActionButton from '../../src/components/shared/ActionButton/ActionButton'

describe('ActionButton', () => {
  it('renders icon with aria-hidden and visible text label', () => {
    render(<ActionButton label="Find My Sneakers" icon={Search} onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /find my sneakers/i })).toBeInTheDocument()
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
