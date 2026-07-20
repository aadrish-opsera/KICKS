import type { ReactElement } from 'react'
import { X } from 'lucide-react'
import { RESULTS } from '../../constants/uiText'
import ActionButton from '../shared/ActionButton/ActionButton'
import styles from './EmptyFilterState.module.css'

export type EmptyFilterStateProps = {
  onClear: () => void
}

function EmptyFilterState({ onClear }: EmptyFilterStateProps): ReactElement {
  return (
    <div className={styles.root} role="status">
      <p>{RESULTS.emptyFilters}</p>
      <ActionButton
        className={styles.clear}
        icon={X}
        label={RESULTS.clearFilters}
        onClick={onClear}
      />
    </div>
  )
}

export default EmptyFilterState
