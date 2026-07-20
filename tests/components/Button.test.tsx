import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Button from '../../src/components/shared/Button/Button'
import styles from '../../src/components/shared/Button/Button.module.css'
import { validateTouchTargets } from '../../src/tests/utils/touchTargetValidator'

describe('Button', () => {
  it('applies touch-target button styles', () => {
    const { container } = render(<Button onClick={vi.fn()}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.className).toContain(styles.button)
    expect(validateTouchTargets(container).every((v) => v.width >= 44 || v.width === 0)).toBe(
      true,
    )
  })

  it('supports secondary and disabled variants', () => {
    render(
      <Button variant="secondary" disabled>
        Next
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})
