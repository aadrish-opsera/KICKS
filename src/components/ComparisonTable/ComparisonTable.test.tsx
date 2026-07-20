import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fiveSneakers } from '../../test-fixtures/sneakerFixtures'
import ComparisonTable from './ComparisonTable'

describe('ComparisonTable', () => {
  it('renders attribute rows for 2 sneakers', () => {
    render(
      <ComparisonTable sneakers={fiveSneakers.slice(0, 2)} aiRankingAvailable={true} />,
    )
    expect(screen.getByLabelText(/sneaker comparison table/i)).toBeInTheDocument()
    expect(screen.getByText(fiveSneakers[0]!.name)).toBeInTheDocument()
    expect(screen.getByText(fiveSneakers[1]!.name)).toBeInTheDocument()
    expect(screen.getByText(/Price/i)).toBeInTheDocument()
  })

  it('renders 3 sneakers', () => {
    render(
      <ComparisonTable sneakers={fiveSneakers.slice(0, 3)} aiRankingAvailable={true} />,
    )
    expect(screen.getByText(fiveSneakers[2]!.name)).toBeInTheDocument()
  })

  it('shows degraded AI message when ranking is unavailable', () => {
    render(
      <ComparisonTable sneakers={fiveSneakers.slice(0, 2)} aiRankingAvailable={false} />,
    )
    expect(screen.getAllByText(/AI insights temporarily unavailable/i).length).toBeGreaterThan(0)
  })

  it('lazy-loads images with descriptive alt text', () => {
    render(
      <ComparisonTable sneakers={fiveSneakers.slice(0, 1)} aiRankingAvailable={true} />,
    )
    const image = screen.getByRole('img', {
      name: new RegExp(`${fiveSneakers[0]!.name} by ${fiveSneakers[0]!.brand}`, 'i'),
    })
    expect(image).toHaveAttribute('loading', 'lazy')
  })
})
