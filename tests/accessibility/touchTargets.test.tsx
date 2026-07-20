import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Button from '../../src/components/shared/Button/Button'
import IconButton from '../../src/components/shared/IconButton/IconButton'
import { validateTouchTargets } from '../../src/tests/utils/touchTargetValidator'

describe('touch target validation', () => {
  it('passes for shared Button and IconButton', () => {
    const { container } = render(
      <div>
        <Button>Find</Button>
        <IconButton ariaLabel="Close">×</IconButton>
      </div>,
    )
    const violations = validateTouchTargets(container).filter(
      (item) => item.width > 0 && item.height > 0,
    )
    expect(violations).toEqual([])
  })
})
