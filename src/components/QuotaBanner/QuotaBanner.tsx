import { useState, type ReactElement } from 'react'
import styles from './QuotaBanner.module.css'

export type QuotaBannerProps = {
  aiRankingAvailable: boolean
}

const BANNER_MESSAGE =
  'AI-powered explanations are temporarily unavailable. Results are sorted by price match to your budget.'

function QuotaBanner({ aiRankingAvailable }: QuotaBannerProps): ReactElement | null {
  const [dismissed, setDismissed] = useState(false)

  if (aiRankingAvailable || dismissed) {
    return null
  }

  return (
    <div className={styles.root} role="status">
      <span className={styles.icon} aria-hidden="true">
        ℹ️
      </span>
      <p className={styles.message}>{BANNER_MESSAGE}</p>
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss notification"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  )
}

export default QuotaBanner
export { BANNER_MESSAGE }
