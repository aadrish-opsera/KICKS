import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { budgetFixtures } from '../../test-fixtures/budgetFixtures'
import { BUDGET_RANGES, DEFAULT_BUDGET, formatBudgetLabel } from '../../types/budget'
import BudgetSelector from './BudgetSelector'

describe('BudgetSelector', () => {
  it('renders four budget options', () => {
    render(
      <BudgetSelector value={DEFAULT_BUDGET} onChange={vi.fn()} />,
    )
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    for (const range of BUDGET_RANGES) {
      expect(screen.getByRole('radio', { name: formatBudgetLabel(range) })).toBeInTheDocument()
    }
  })

  it('pre-selects mid range for the $50-$150 default', () => {
    render(<BudgetSelector value={DEFAULT_BUDGET} onChange={vi.fn()} />)
    const mid = screen.getByRole('radio', { name: formatBudgetLabel(budgetFixtures.midLow) })
    expect(mid).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange with BudgetRange when an option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BudgetSelector value={budgetFixtures.midLow} onChange={onChange} />)

    await user.click(
      screen.getByRole('radio', { name: formatBudgetLabel(budgetFixtures.midHigh) }),
    )
    expect(onChange).toHaveBeenCalledWith(budgetFixtures.midHigh)
  })

  it('does not fire onChange when clicking the already-selected option', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BudgetSelector value={budgetFixtures.midLow} onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: formatBudgetLabel(budgetFixtures.midLow) }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('falls back to default mid selection for unmatched values', () => {
    render(<BudgetSelector value={budgetFixtures.unmatched} onChange={vi.fn()} />)
    expect(
      screen.getByRole('radio', { name: formatBudgetLabel(budgetFixtures.midLow) }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('supports arrow key navigation', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BudgetSelector value={budgetFixtures.midLow} onChange={onChange} />)
    const selected = screen.getByRole('radio', { name: formatBudgetLabel(budgetFixtures.midLow) })
    selected.focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(budgetFixtures.midHigh)
  })

  it('honors disabled state', () => {
    render(<BudgetSelector value={DEFAULT_BUDGET} onChange={vi.fn()} disabled />)
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled()
    }
  })
})
