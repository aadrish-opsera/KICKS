import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { successResponse } from '../../test-fixtures/apiResponseFixtures'
import HomePage from './HomePage'

const navigateMock = vi.fn()
const submitMock = vi.fn()
const retryMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../hooks/useRecommendation', () => ({
  useRecommendation: () => mockHookState,
}))

let mockHookState: {
  data: typeof successResponse | null
  error: { code: string; message: string } | null
  isLoading: boolean
  submit: typeof submitMock
  retry: typeof retryMock
}

describe('HomePage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    submitMock.mockReset()
    retryMock.mockReset()
    mockHookState = {
      data: null,
      error: null,
      isLoading: false,
      submit: submitMock,
      retry: retryMock,
    }
  })

  it('renders preference and budget controls with disabled submit when empty', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(screen.getByLabelText(/what kind of sneakers/i)).toBeInTheDocument()
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /find my sneakers/i })).toBeDisabled()
  })

  it('submits sanitized preferences and budget', async () => {
    const user = userEvent.setup()
    submitMock.mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await user.type(screen.getByRole('textbox'), 'blue nike runners')
    await user.click(screen.getByRole('button', { name: /find my sneakers/i }))

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalled()
    })
    expect(submitMock.mock.calls[0]?.[0]).toBe('blue nike runners')
    expect(submitMock.mock.calls[0]?.[1]).toEqual({ min: 50, max: 150 })
  })

  it('shows error state and retries without clearing inputs', async () => {
    const user = userEvent.setup()
    mockHookState = {
      ...mockHookState,
      error: { code: 'NETWORK_ERROR', message: 'offline' },
    }
    const { rerender } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await user.type(screen.getByRole('textbox'), 'kept text here')
    expect(screen.getByRole('alert')).toHaveTextContent(/offline|connection/i)

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(retryMock).toHaveBeenCalled()

    rerender(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('textbox')).toHaveValue('kept text here')
  })

  it('navigates to results when recommendation data arrives', async () => {
    mockHookState = {
      ...mockHookState,
      data: successResponse,
    }
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/results', {
        state: { recommendation: successResponse },
      })
    })
  })

  it('shows loading skeleton while requesting', () => {
    mockHookState = {
      ...mockHookState,
      isLoading: true,
    }
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })
})
