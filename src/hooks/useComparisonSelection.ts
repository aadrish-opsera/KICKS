import { useCallback, useMemo, useState } from 'react'

const MAX_SELECTION = 3

export type UseComparisonSelectionResult = {
  selectedIds: readonly string[]
  selectionCount: number
  canAddMore: boolean
  canCompare: boolean
  limitMessage: string | null
  isSelected: (id: string) => boolean
  toggleSelection: (id: string) => void
  clearSelection: () => void
}

export function useComparisonSelection(
  maxSelection: number = MAX_SELECTION,
): UseComparisonSelectionResult {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  const isSelected = useCallback(
    (id: string): boolean => selectedIds.includes(id),
    [selectedIds],
  )

  const toggleSelection = useCallback(
    (id: string): void => {
      setSelectedIds((previous) => {
        if (previous.includes(id)) {
          setLimitMessage(null)
          return previous.filter((item) => item !== id)
        }
        if (previous.length >= maxSelection) {
          setLimitMessage('Please deselect one sneaker before adding another')
          return previous
        }
        setLimitMessage(null)
        return [...previous, id]
      })
    },
    [maxSelection],
  )

  const clearSelection = useCallback((): void => {
    setSelectedIds([])
    setLimitMessage(null)
  }, [])

  return useMemo(
    () => ({
      selectedIds,
      selectionCount: selectedIds.length,
      canAddMore: selectedIds.length < maxSelection,
      canCompare: selectedIds.length >= 2 && selectedIds.length <= maxSelection,
      limitMessage,
      isSelected,
      toggleSelection,
      clearSelection,
    }),
    [
      selectedIds,
      maxSelection,
      limitMessage,
      isSelected,
      toggleSelection,
      clearSelection,
    ],
  )
}
