import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  completeSneaker,
  sneakerWithNoResaleLinks,
} from '../../test-fixtures/sneakerFixtures'
import SneakerDetail from './SneakerDetail'

describe('SneakerDetail', () => {
  it('renders complete sneaker details', () => {
    render(
      <SneakerDetail sneaker={completeSneaker} isOpen={true} onClose={vi.fn()} />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: completeSneaker.name })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /buy on stockx/i })).toHaveAttribute(
      'target',
      '_blank',
    )
    expect(screen.getByRole('link', { name: /buy on stockx/i })).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener'),
    )
  })

  it('shows resale fallback when links are missing', () => {
    render(
      <SneakerDetail
        sneaker={sneakerWithNoResaleLinks}
        isOpen={true}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText(/resale info not available/i)).toBeInTheDocument()
  })

  it('closes on Escape and close button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(
      <SneakerDetail sneaker={completeSneaker} isOpen={true} onClose={onClose} />,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
    onClose.mockClear()
    await user.click(screen.getByRole('button', { name: /close details/i }))
    expect(onClose).toHaveBeenCalled()
    rerender(<SneakerDetail sneaker={completeSneaker} isOpen={false} onClose={onClose} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
