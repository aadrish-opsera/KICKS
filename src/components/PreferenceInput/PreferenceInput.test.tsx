import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  preferenceTooLong,
  preferenceXssPayloads,
} from '../../test-fixtures/preferenceInputFixtures'
import PreferenceInput, {
  PREFERENCE_MAX_LENGTH,
  PREFERENCE_MIN_LENGTH,
} from './PreferenceInput'

describe('PreferenceInput', () => {
  it('renders label, textarea, and character counter', () => {
    render(
      <PreferenceInput value="" onChange={vi.fn()} onValidationChange={vi.fn()} />,
    )
    expect(screen.getByLabelText(/what kind of sneakers/i)).toBeInTheDocument()
    expect(screen.getByText(`0 / ${PREFERENCE_MAX_LENGTH}`)).toBeInTheDocument()
  })

  it('rejects empty and 2-char input via validation callback', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValidationChange = vi.fn()
    render(
      <PreferenceInput
        value=""
        onChange={onChange}
        onValidationChange={onValidationChange}
      />,
    )

    await user.type(screen.getByRole('textbox'), 'ab')
    expect(onValidationChange).toHaveBeenCalledWith(false)
  })

  it('accepts 3-char input', async () => {
    const user = userEvent.setup()
    const onValidationChange = vi.fn()
    let current = ''
    const onChange = vi.fn((next: string) => {
      current = next
      rerender(
        <PreferenceInput
          value={current}
          onChange={onChange}
          onValidationChange={onValidationChange}
        />,
      )
    })
    const { rerender } = render(
      <PreferenceInput
        value={current}
        onChange={onChange}
        onValidationChange={onValidationChange}
      />,
    )

    await user.type(screen.getByRole('textbox'), 'abc')
    expect(onValidationChange).toHaveBeenCalledWith(true)
    expect(current.length).toBe(PREFERENCE_MIN_LENGTH)
  })

  it('accepts 500-char input and blocks growth past max via maxLength', async () => {
    const user = userEvent.setup()
    const long = 'e'.repeat(PREFERENCE_MAX_LENGTH)
    let current = ''
    const onValidationChange = vi.fn()
    const onChange = vi.fn((next: string) => {
      current = next
      rerender(
        <PreferenceInput
          value={current}
          onChange={onChange}
          onValidationChange={onValidationChange}
        />,
      )
    })
    const { rerender } = render(
      <PreferenceInput
        value={current}
        onChange={onChange}
        onValidationChange={onValidationChange}
      />,
    )

    await user.click(screen.getByRole('textbox'))
    await user.paste(long)
    expect(current.length).toBeLessThanOrEqual(PREFERENCE_MAX_LENGTH)
    expect(onValidationChange).toHaveBeenCalledWith(true)

    await user.paste(preferenceTooLong[0]!)
    expect(current.length).toBeLessThanOrEqual(PREFERENCE_MAX_LENGTH)
  })

  it('sanitizes XSS strings before calling onChange', async () => {
    const user = userEvent.setup()
    let current = ''
    const onChange = vi.fn((next: string) => {
      current = next
      rerender(
        <PreferenceInput value={current} onChange={onChange} onValidationChange={vi.fn()} />,
      )
    })
    const { rerender } = render(
      <PreferenceInput value={current} onChange={onChange} onValidationChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('textbox'))
    await user.paste(preferenceXssPayloads[0]!)
    expect(current).not.toMatch(/<script/i)
  })

  it('retains value across re-render', () => {
    const { rerender } = render(
      <PreferenceInput value="kept value" onChange={vi.fn()} onValidationChange={vi.fn()} />,
    )
    expect(screen.getByRole('textbox')).toHaveValue('kept value')
    rerender(
      <PreferenceInput value="kept value" onChange={vi.fn()} onValidationChange={vi.fn()} />,
    )
    expect(screen.getByRole('textbox')).toHaveValue('kept value')
  })

  it('exposes aria attributes for accessibility', () => {
    render(
      <PreferenceInput value="ab" onChange={vi.fn()} onValidationChange={vi.fn()} />,
    )
    const field = screen.getByRole('textbox')
    expect(field).toHaveAttribute('aria-describedby')
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument()
  })

  it('honors disabled state', () => {
    render(
      <PreferenceInput
        value=""
        onChange={vi.fn()}
        onValidationChange={vi.fn()}
        disabled
      />,
    )
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
