import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import HomePage from '../../src/pages/HomePage/HomePage'

vi.mock('../../src/hooks/useRecommendation', () => ({
  useRecommendation: () => ({
    data: null,
    error: null,
    isLoading: false,
    submit: vi.fn(),
    retry: vi.fn(),
  }),
}))

describe('keyboard navigation', () => {
  it('tabs through HomePage form controls in order', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const textbox = screen.getByRole('textbox')
    await user.click(textbox)
    await user.keyboard('blue nike runners')

    textbox.focus()
    expect(textbox).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('slider')).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('radio', { checked: true })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: /find my sneakers/i })).toHaveFocus()
  })
})
