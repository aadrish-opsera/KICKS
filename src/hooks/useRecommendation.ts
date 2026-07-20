import { useCallback, useEffect, useRef, useState } from 'react'
import type { BudgetRange } from '../shared/types/budget'
import type { RecommendationResponse } from '../shared/types/recommendation'
import {
  postRecommendation,
  RecommendationApiError,
  type RecommendClient,
} from '../services/recommendationApi'

export type RecommendationError = {
  code: string
  message: string
}

export type UseRecommendationResult = {
  data: RecommendationResponse | null
  error: RecommendationError | null
  isLoading: boolean
  submit: (preferences: string, budget: BudgetRange) => Promise<void>
  retry: () => Promise<void>
}

export type UseRecommendationOptions = {
  apiClient?: RecommendClient
}

export function useRecommendation(
  options: UseRecommendationOptions = {},
): UseRecommendationResult {
  const apiClient = options.apiClient ?? postRecommendation
  const [data, setData] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<RecommendationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const lastRequestRef = useRef<{ preferences: string; budget: BudgetRange } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const submit = useCallback(
    async (preferences: string, budget: BudgetRange): Promise<void> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      lastRequestRef.current = { preferences, budget }
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient({ preferences, budget }, controller.signal)
        if (controller.signal.aborted) {
          return
        }
        setData(response)
        setError(null)
      } catch (caught) {
        if (controller.signal.aborted) {
          return
        }
        if (caught instanceof RecommendationApiError) {
          setError({ code: caught.code, message: caught.message })
        } else {
          setError({
            code: 'UNKNOWN_ERROR',
            message: 'Something went wrong. Please try again.',
          })
        }
        setData(null)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [apiClient],
  )

  const retry = useCallback(async (): Promise<void> => {
    const last = lastRequestRef.current
    if (!last) {
      return
    }
    await submit(last.preferences, last.budget)
  }, [submit])

  return { data, error, isLoading, submit, retry }
}
