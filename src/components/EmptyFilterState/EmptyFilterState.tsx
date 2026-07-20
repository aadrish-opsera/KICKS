import type { ReactElement } from 'react'
import styles from './EmptyFilterState.module.css'

export type EmptyFilterStateProps = {
  onClear: () => void
}

function EmptyFilterState({ onClear }: EmptyFilterStateProps): ReactElement {
  return (
    <div className={styles.root} role="status">
      <p>No sneakers match your filters. Try adjusting or clearing filters.</p>
      <button type="button" className={styles.clear} onClick={onClear}>
        Clear Filters
      </button>
    </div>
  )
}

export default EmptyFilterState
