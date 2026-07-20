import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import QuotaBanner, { BANNER_MESSAGE } from './QuotaBanner'

describe('QuotaBanner', () => {
  it('renders when AI ranking is unavailable', () => {
    render(<QuotaBanner aiRankingAvailable={false} />)
    expect(screen.getByRole('status')).toHaveTextContent(BANNER_MESSAGE)
  })

  it('does not render when AI ranking is available', () => {
    const { container } = render(<QuotaBanner aiRankingAvailable={true} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('hides after dismiss', async () => {
    const user = userEvent.setup()
    const { container } = render(<QuotaBanner aiRankingAvailable={false} />)
    await user.click(screen.getByRole('button', { name: /dismiss notification/i }))
    expect(container).toBeEmptyDOMElement()
  })
})
