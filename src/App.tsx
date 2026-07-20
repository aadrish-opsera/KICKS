import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ComparisonProvider } from './context/ComparisonContext'
import ComparisonPage from './pages/ComparisonPage/ComparisonPage'
import HomePage from './pages/HomePage/HomePage'
import ResultsPage from './pages/ResultsPage/ResultsPage'

function App() {
  return (
    <BrowserRouter>
      <ComparisonProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
        </Routes>
      </ComparisonProvider>
      <Analytics />
    </BrowserRouter>
  )
}

export default App
