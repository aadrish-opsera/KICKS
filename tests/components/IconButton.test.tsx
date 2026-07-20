import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import IconButton from '../../src/components/shared/IconButton/IconButton'
import styles from '../../src/components/shared/IconButton/IconButton.module.css'

describe('IconButton', () => {
  it('requires aria-label and applies touch-target styles', () => {
    render(
      <IconButton ariaLabel="Close dialog" onClick={vi.fn()}>
        ×
      </IconButton>,
    )
    const button = screen.getByRole('button', { name: 'Close dialog' })
    expect(button.className).toContain(styles.button)
  })
})
