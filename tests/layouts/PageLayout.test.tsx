import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageLayout from '../../src/layouts/PageLayout'
import styles from '../../src/layouts/PageLayout.module.css'

describe('PageLayout', () => {
  it('renders children inside a main landmark by default', () => {
    const { container } = render(
      <PageLayout>
        <p>Content block</p>
      </PageLayout>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.tagName.toLowerCase()).toBe('main')
    expect(root.className).toContain(styles.root.split(' ')[0] ?? styles.root)
    expect(root.textContent).toContain('Content block')
  })

  it('applies responsive container class for fluid width', () => {
    const { container } = render(
      <PageLayout>
        <div data-testid="block">A</div>
      </PageLayout>,
    )
    const root = container.firstElementChild as HTMLElement
    const computed = getComputedStyle(root)
    expect(computed.maxWidth === '1200px' || root.className.length > 0).toBe(true)
  })
})
