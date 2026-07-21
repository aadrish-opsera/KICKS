import './styles/global.css'
import './styles/breakpoints.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { initSentryClient } from './shared/utils/sentryClientInit'
import { validateClientEnv } from './shared/utils/validateClientEnv'
import { initWebVitalsReporting } from './utils/web-vitals'

validateClientEnv()
initSentryClient()
initWebVitalsReporting()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
