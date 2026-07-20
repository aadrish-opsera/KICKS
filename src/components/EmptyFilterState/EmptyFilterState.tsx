import type { ReactElement } from 'react'
import { RESULTS } from '../../constants/uiText'
import styles from './EmptyFilterState.module.css'

export type EmptyFilterStateProps = {
  onClear: () => void
}

function EmptyFilterState({ onClear }: EmptyFilterStateProps): ReactElement {
  return (
    <div className={styles.root} role="status">
      <p>{RESULTS.emptyFilters}</p>
      <button type="button" className={styles.clear} onClick={onClear}>
        {RESULTS.clearFilters}
      </button>
    </div>
  )
}

export default EmptyFilterState
