import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import type { Sneaker } from '../shared/types/sneaker'

export type ComparisonContextValue = {
  selectedSneakers: readonly Sneaker[]
  aiRankingAvailable: boolean
  setComparison: (sneakers: readonly Sneaker[], aiRankingAvailable: boolean) => void
  clearComparison: () => void
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null)

export type ComparisonProviderProps = {
  children: ReactNode
}

export function ComparisonProvider({ children }: ComparisonProviderProps): ReactElement {
  const [selectedSneakers, setSelectedSneakers] = useState<readonly Sneaker[]>([])
  const [aiRankingAvailable, setAiRankingAvailable] = useState(true)

  const setComparison = useCallback(
    (sneakers: readonly Sneaker[], rankingAvailable: boolean): void => {
      setSelectedSneakers(sneakers)
      setAiRankingAvailable(rankingAvailable)
    },
    [],
  )

  const clearComparison = useCallback((): void => {
    setSelectedSneakers([])
    setAiRankingAvailable(true)
  }, [])

  const value = useMemo(
    () => ({
      selectedSneakers,
      aiRankingAvailable,
      setComparison,
      clearComparison,
    }),
    [selectedSneakers, aiRankingAvailable, setComparison, clearComparison],
  )

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>
}

export function useComparisonContext(): ComparisonContextValue {
  const value = useContext(ComparisonContext)
  if (!value) {
    throw new Error('useComparisonContext must be used within ComparisonProvider')
  }
  return value
}
