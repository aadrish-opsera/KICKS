import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useComparisonSelection } from './useComparisonSelection'

describe('useComparisonSelection', () => {
  it('starts empty with compare disabled', () => {
    const { result } = renderHook(() => useComparisonSelection())
    expect(result.current.selectionCount).toBe(0)
    expect(result.current.canCompare).toBe(false)
    expect(result.current.canAddMore).toBe(true)
  })

  it('enables compare at 2 and 3 selections', () => {
    const { result } = renderHook(() => useComparisonSelection())
    act(() => result.current.toggleSelection('a'))
    expect(result.current.canCompare).toBe(false)
    act(() => result.current.toggleSelection('b'))
    expect(result.current.canCompare).toBe(true)
    act(() => result.current.toggleSelection('c'))
    expect(result.current.canCompare).toBe(true)
    expect(result.current.selectionCount).toBe(3)
  })

  it('blocks a 4th selection with a friendly message', () => {
    const { result } = renderHook(() => useComparisonSelection())
    act(() => {
      result.current.toggleSelection('a')
      result.current.toggleSelection('b')
      result.current.toggleSelection('c')
      result.current.toggleSelection('d')
    })
    expect(result.current.selectedIds).toEqual(['a', 'b', 'c'])
    expect(result.current.limitMessage).toMatch(/deselect one sneaker/i)
  })

  it('deselects and clears the limit message', () => {
    const { result } = renderHook(() => useComparisonSelection())
    act(() => {
      result.current.toggleSelection('a')
      result.current.toggleSelection('b')
      result.current.toggleSelection('c')
      result.current.toggleSelection('d')
    })
    act(() => result.current.toggleSelection('c'))
    expect(result.current.selectionCount).toBe(2)
    expect(result.current.limitMessage).toBeNull()
    expect(result.current.isSelected('c')).toBe(false)
  })

  it('clearSelection resets all state', () => {
    const { result } = renderHook(() => useComparisonSelection())
    act(() => {
      result.current.toggleSelection('a')
      result.current.toggleSelection('b')
      result.current.clearSelection()
    })
    expect(result.current.selectedIds).toEqual([])
    expect(result.current.limitMessage).toBeNull()
  })
})
