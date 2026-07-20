import type { ReactElement } from 'react'
import { getErrorMessage } from '../../utils/errorMessages'
import styles from './ErrorState.module.css'

export type ErrorStateProps = {
  errorCode: string
  onRetry: () => void
}

function ErrorState({ errorCode, onRetry }: ErrorStateProps): ReactElement {
  const content = getErrorMessage(errorCode)

  return (
    <div className={styles.root} role="alert">
      <div className={styles.icon} aria-hidden="true">
        {content.icon}
      </div>
      <h2 className={styles.title}>{content.title}</h2>
      <p className={styles.message}>{content.message}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        <span aria-hidden="true">↻</span>
        Try Again
      </button>
    </div>
  )
}

export default ErrorState
