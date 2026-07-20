import {
  useCallback,
  useMemo,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react'
import {
  BUDGET_RANGES,
  DEFAULT_BUDGET,
  budgetsEqual,
  formatBudgetLabel,
  type BudgetRange,
} from '../../types/budget'
import { HOME } from '../../constants/uiText'
import sliderStyles from '../../styles/slider.module.css'
import styles from './BudgetSelector.module.css'

export type BudgetSelectorProps = {
  value: BudgetRange
  onChange: (range: BudgetRange) => void
  disabled?: boolean
}

function resolveSelectedIndex(value: BudgetRange): number {
  const exact = BUDGET_RANGES.findIndex((range) => budgetsEqual(range, value))
  if (exact >= 0) {
    return exact
  }
  // Unmatched / synthetic default ($50-$150): fall back to mid-low chip visually.
  if (budgetsEqual(value, DEFAULT_BUDGET)) {
    return 1
  }
  return 1
}

function BudgetSelector({
  value,
  onChange,
  disabled = false,
}: BudgetSelectorProps): ReactElement {
  const selectedIndex = useMemo(() => resolveSelectedIndex(value), [value])

  const selectAt = useCallback(
    (index: number): void => {
      if (disabled) {
        return
      }
      const next = BUDGET_RANGES[index]
      if (!next) {
        return
      }
      if (budgetsEqual(next, value)) {
        return
      }
      onChange({ min: next.min, max: next.max })
    },
    [disabled, onChange, value],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) {
      return
    }
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }
    event.preventDefault()
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    const nextIndex = (selectedIndex + delta + BUDGET_RANGES.length) % BUDGET_RANGES.length
    selectAt(nextIndex)
  }

  return (
    <div className={styles.root}>
      <p className={styles.label} id="budget-selector-label">
        {HOME.budgetLabel}
      </p>
      <input
        type="range"
        className={`${sliderStyles.range} ${styles.slider}`}
        min={0}
        max={BUDGET_RANGES.length - 1}
        step={1}
        value={selectedIndex}
        disabled={disabled}
        aria-labelledby="budget-selector-label"
        aria-valuetext={formatBudgetLabel(BUDGET_RANGES[selectedIndex] ?? DEFAULT_BUDGET)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          selectAt(Number(event.target.value))
        }}
      />
      <div
        className={styles.group}
        role="radiogroup"
        aria-labelledby="budget-selector-label"
        onKeyDown={handleKeyDown}
      >
        {BUDGET_RANGES.map((range, index) => {
          const checked = index === selectedIndex
          const label = formatBudgetLabel(range)
          return (
            <button
              key={`${range.min}-${range.max}`}
              type="button"
              role="radio"
              className={checked ? `${styles.option} ${styles.optionSelected}` : styles.option}
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              disabled={disabled}
              onClick={() => selectAt(index)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BudgetSelector
