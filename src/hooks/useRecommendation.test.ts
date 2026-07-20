import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecommendationApiError } from '../services/recommendationApi'
import { successResponse } from '../test-fixtures/apiResponseFixtures'
import { DEFAULT_BUDGET } from '../types/budget'
import { useRecommendation } from './useRecommendation'

describe('useRecommendation', () => {
  it('sets loading then data on success', async () => {
    let resolveRequest!: (value: typeof successResponse) => void
    const apiClient = vi.fn(
      () =>
        new Promise<typeof successResponse>((resolve) => {
          resolveRequest = resolve
        }),
    )
    const { result } = renderHook(() => useRecommendation({ apiClient }))

    let pending!: Promise<void>
    act(() => {
      pending = result.current.submit('blue nike runners', DEFAULT_BUDGET)
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveRequest(successResponse)
      await pending
    })

    expect(result.current.data).toEqual(successResponse)
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('sets typed error on API failure', async () => {
    const apiClient = vi
      .fn()
      .mockRejectedValue(new RecommendationApiError('GATEWAY_TIMEOUT', 'timeout', 504))
    const { result } = renderHook(() => useRecommendation({ apiClient }))

    await act(async () => {
      await result.current.submit('blue nike runners', DEFAULT_BUDGET)
    })

    expect(result.current.error?.code).toBe('GATEWAY_TIMEOUT')
    expect(result.current.data).toBeNull()
  })

  it('retry reuses the previous preferences and budget', async () => {
    const apiClient = vi
      .fn()
      .mockRejectedValueOnce(new RecommendationApiError('NETWORK_ERROR', 'offline'))
      .mockResolvedValueOnce(successResponse)
    const { result } = renderHook(() => useRecommendation({ apiClient }))

    await act(async () => {
      await result.current.submit('kept preferences', DEFAULT_BUDGET)
    })
    await act(async () => {
      await result.current.retry()
    })

    expect(apiClient).toHaveBeenCalledTimes(2)
    expect(apiClient.mock.calls[1]?.[0]).toEqual({
      preferences: 'kept preferences',
      budget: DEFAULT_BUDGET,
    })
    expect(result.current.data).toEqual(successResponse)
  })
})
