import type { ReactElement } from 'react'
import { Scale } from 'lucide-react'
import ActionButton from '../shared/ActionButton/ActionButton'
import { RESULTS } from '../../constants/uiText'
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
      ? RESULTS.compareButton
      : `${RESULTS.compareButton} (${selectionCount})`

  return (
    <ActionButton
      className={styles.button}
      icon={Scale}
      label={label}
      disabled={isDisabled}
      onClick={onClick}
      aria-disabled={isDisabled}
    />
  )
}

export default CompareButton
