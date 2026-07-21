import type { ReactElement } from 'react'
import styles from './LoadingFallback.module.css'

/**
 * Suspense fallback for route-level React.lazy chunks (WO-151).
 * Friendly copy — no stack traces or technical jargon.
 */
function LoadingFallback(): ReactElement {
  return (
    <main className={styles.root} role="status" aria-live="polite">
      <p className={styles.message}>Loading page…</p>
      <p className={styles.hint}>Hang tight — this will only take a moment.</p>
    </main>
  )
}

export default LoadingFallback
