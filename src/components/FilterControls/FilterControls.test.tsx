import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { fiveSneakers } from '../../test-fixtures/sneakerFixtures'
import { EMPTY_FILTER_STATE } from '../../types/filters'
import FilterControls from './FilterControls'

describe('FilterControls', () => {
  it('renders brand pills from sneaker data', () => {
    render(
      <FilterControls
        sneakers={fiveSneakers}
        filters={EMPTY_FILTER_STATE}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Nike' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adidas' })).toBeInTheDocument()
  })

  it('emits brand filter changes and clear', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterControls
        sneakers={fiveSneakers}
        filters={EMPTY_FILTER_STATE}
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Nike' }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ brand: 'Nike' }),
    )
    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTER_STATE)
  })
})
