import type { ReactElement } from 'react'
import { LOADING } from '../../constants/uiText'
import styles from './LoadingSkeleton.module.css'

export type LoadingSkeletonProps = {
  count?: number
}

function LoadingSkeleton({ count = 5 }: LoadingSkeletonProps): ReactElement {
  const cards = Array.from({ length: count }, (_, index) => index)

  return (
    <div className={styles.root} data-testid="loading-skeleton">
      <div className={styles.status} role="status" aria-live="polite">
        {LOADING.message}
      </div>
      <div className={styles.grid}>
        {cards.map((index) => (
          <div key={index} className={styles.card} aria-hidden="true">
            <div className={`${styles.image} ${styles.shimmer}`} />
            <div className={`${styles.line} ${styles.lineFull} ${styles.shimmer}`} />
            <div className={`${styles.line} ${styles.lineThreeQuarter} ${styles.shimmer}`} />
            <div className={`${styles.line} ${styles.lineHalf} ${styles.shimmer}`} />
            <div className={`${styles.button} ${styles.shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoadingSkeleton
