import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  completeSneaker,
  sneakerWithNoExplanation,
  sneakerWithNoResaleLinks,
  sneakerWithXSSExplanation,
  sneakerWithZeroPrice,
} from '../../test-fixtures/sneakerFixtures'
import SneakerCard from './SneakerCard'

describe('SneakerCard', () => {
  it('renders core sneaker fields and rank', () => {
    render(
      <SneakerCard
        sneaker={completeSneaker}
        rank={1}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText(completeSneaker.name)).toBeInTheDocument()
    expect(screen.getByText(/Nike · White\/Black/)).toBeInTheDocument()
    expect(screen.getByLabelText('Rank 1')).toHaveTextContent('1')
    expect(screen.getByText(/\$130/)).toBeInTheDocument()
  })

  it('sanitizes XSS in AI explanation', () => {
    render(
      <SneakerCard
        sneaker={sneakerWithXSSExplanation}
        rank={2}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.queryByText(/<script/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Soft cushioned runner/i)).toBeInTheDocument()
  })

  it('shows fallback explanation and price unavailable', () => {
    render(
      <SneakerCard
        sneaker={{ ...sneakerWithNoExplanation, retailPrice: 0 }}
        rank={3}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText(/no explanation available/i)).toBeInTheDocument()
    expect(screen.getByText(/price unavailable/i)).toBeInTheDocument()
  })

  it('shows message when resale links are missing', () => {
    render(
      <SneakerCard
        sneaker={sneakerWithNoResaleLinks}
        rank={4}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText(/no resale links available/i)).toBeInTheDocument()
  })

  it('opens resale links in a new tab', () => {
    render(
      <SneakerCard
        sneaker={completeSneaker}
        rank={1}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )
    const link = screen.getByRole('link', { name: /buy on stockx/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('fires onSelect from the comparison checkbox', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <SneakerCard
        sneaker={completeSneaker}
        rank={1}
        isSelected={false}
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('checkbox', { name: /select air max 90/i }))
    expect(onSelect).toHaveBeenCalledWith(completeSneaker.id, true)
  })

  it('swaps to placeholder when image fails', () => {
    render(
      <SneakerCard
        sneaker={completeSneaker}
        rank={1}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )
    const image = screen.getByRole('img', { name: /air max 90/i })
    fireEvent.error(image)
    expect((image as HTMLImageElement).src).toMatch(/sneaker-placeholder/)
  })

  it('formats zero price as unavailable', () => {
    render(
      <SneakerCard
        sneaker={sneakerWithZeroPrice}
        rank={5}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText(/price unavailable/i)).toBeInTheDocument()
  })
})
