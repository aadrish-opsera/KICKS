import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { errorMessageFixtures } from '../../test-fixtures/errorFixtures'
import ErrorState from './ErrorState'

describe('ErrorState', () => {
  it('renders the mapped message for each error code', () => {
    for (const fixture of errorMessageFixtures) {
      const { unmount } = render(
        <ErrorState errorCode={fixture.code} onRetry={vi.fn()} />,
      )
      expect(screen.getByRole('alert')).toHaveTextContent(fixture.message)
      expect(screen.queryByText(fixture.code)).not.toBeInTheDocument()
      unmount()
    }
  })

  it('fires onRetry when Try Again is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState errorCode="NETWORK_ERROR" onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows fallback for unknown codes without leaking technical details', () => {
    render(<ErrorState errorCode="SOME_STACK_TRACE" onRetry={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    expect(screen.queryByText(/SOME_STACK_TRACE/)).not.toBeInTheDocument()
    expect(screen.queryByText(/500|stack|exception/i)).not.toBeInTheDocument()
  })
})
