import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { useFocusTrap } from './useFocusTrap'

function TrapDemo({ active }: { active: boolean }): ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, active)
  return (
    <div ref={ref}>
      <button type="button">First</button>
      <button type="button">Second</button>
    </div>
  )
}

describe('useFocusTrap', () => {
  it('cycles focus from last to first on Tab', async () => {
    const user = userEvent.setup()
    render(<TrapDemo active={true} />)
    const first = screen.getByRole('button', { name: 'First' })
    const second = screen.getByRole('button', { name: 'Second' })
    expect(first).toHaveFocus()
    await user.tab()
    expect(second).toHaveFocus()
    await user.tab()
    expect(first).toHaveFocus()
  })
})
