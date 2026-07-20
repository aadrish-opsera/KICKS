import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PreferenceInput from '../../../src/components/PreferenceInput/PreferenceInput'
import BudgetSelector from '../../../src/components/BudgetSelector/BudgetSelector'
import SneakerCard from '../../../src/components/SneakerCard/SneakerCard'
import ComparisonTable from '../../../src/components/ComparisonTable/ComparisonTable'
import QuotaBanner from '../../../src/components/QuotaBanner/QuotaBanner'
import ErrorState from '../../../src/components/ErrorState/ErrorState'
import { DEFAULT_BUDGET } from '../../../src/types/budget'
import type { Sneaker } from '../../../src/shared/types/sneaker'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/frontend')
const sneakers = JSON.parse(
  readFileSync(join(fixturesDir, 'mock-sneaker-results.json'), 'utf8'),
) as Sneaker[]

describe('Frontend component suite (WO-148)', () => {
  it('PreferenceInput exposes an accessible labeled control', () => {
    render(
      <PreferenceInput value="" onChange={vi.fn()} onValidationChange={vi.fn()} />,
    )
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('BudgetSelector renders the default mid budget selection', () => {
    render(<BudgetSelector value={DEFAULT_BUDGET} onChange={vi.fn()} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(4)
  })

  it('SneakerCard renders core fields and degraded explanation gracefully', () => {
    render(
      <SneakerCard sneaker={sneakers[1]!} rank={1} selectable={false} />,
    )
    expect(screen.getByText(sneakers[1]!.name)).toBeInTheDocument()
    expect(screen.getByText(/adidas/i)).toBeInTheDocument()
  })

  it('ComparisonTable renders two sneakers', () => {
    render(
      <ComparisonTable sneakers={sneakers.slice(0, 2)} aiRankingAvailable />,
    )
    expect(screen.getByLabelText(/sneaker comparison table/i)).toBeInTheDocument()
  })

  it('QuotaBanner shows only when AI ranking is unavailable', () => {
    const { rerender } = render(<QuotaBanner aiRankingAvailable={false} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<QuotaBanner aiRankingAvailable />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('ErrorState shows Try Again without raw stack traces', () => {
    render(<ErrorState errorCode="NETWORK_ERROR" onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/stack|TypeError/i)
  })
})
