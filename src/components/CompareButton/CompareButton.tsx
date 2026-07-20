import type { ReactElement } from 'react'
import styles from './CompareButton.module.css'

export type CompareButtonProps = {
  selectionCount: number
  disabled?: boolean
  onClick: () => void
}

function CompareButton({
  selectionCount,
  disabled = false,
  onClick,
}: CompareButtonProps): ReactElement {
  const isDisabled = disabled || selectionCount < 2
  const label =
    selectionCount < 2
      ? 'Compare sneakers'
      : `Compare ${selectionCount} Sneaker${selectionCount === 1 ? '' : 's'}`

  return (
    <button
      type="button"
      className={styles.button}
      disabled={isDisabled}
      onClick={onClick}
      aria-disabled={isDisabled}
    >
      <span aria-hidden="true">⚖️</span>
      {label}
    </button>
  )
}

export default CompareButton
