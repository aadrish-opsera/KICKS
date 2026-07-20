import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CompareButton from './CompareButton'

describe('CompareButton', () => {
  it('is disabled below 2 selections', () => {
    render(<CompareButton selectionCount={1} onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows count and fires onClick when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<CompareButton selectionCount={2} onClick={onClick} />)
    const button = screen.getByRole('button', { name: /compare selected \(2\)/i })
    expect(button).toBeEnabled()
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
