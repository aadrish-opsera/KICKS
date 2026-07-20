import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HomePage from '../../src/pages/HomePage/HomePage'
import pageStyles from '../../src/pages/HomePage/HomePage.module.css'

describe('HomePage layout shell', () => {
  it('renders a single-column page shell without overflowing the document', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(container.querySelector(`.${pageStyles.page}`)).toBeTruthy()
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      Math.max(document.documentElement.clientWidth, 320),
    )
  })
})
