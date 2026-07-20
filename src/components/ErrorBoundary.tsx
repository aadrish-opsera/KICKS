import * as Sentry from '@sentry/react'
import type { ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

function ErrorFallback() {
  return (
    <main className="container" role="alert">
      <h1>Something went wrong</h1>
      <p>Please reload the page and try again.</p>
      <button type="button" onClick={() => window.location.reload()}>
        Reload
      </button>
    </main>
  )
}

function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </Sentry.ErrorBoundary>
  )
}

export default ErrorBoundary
