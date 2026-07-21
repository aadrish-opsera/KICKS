import { Analytics } from '@vercel/analytics/react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoadingFallback from './components/LoadingFallback/LoadingFallback'
import { ComparisonProvider } from './context/ComparisonContext'

const HomePage = lazy(() => import('./pages/HomePage/HomePage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage/ResultsPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage/ComparisonPage'))

function App() {
  return (
    <BrowserRouter>
      <ComparisonProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
          </Routes>
        </Suspense>
      </ComparisonProvider>
      <Analytics />
    </BrowserRouter>
  )
}

export default App
