import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ComparisonPage from './pages/ComparisonPage'
import HomePage from './pages/HomePage/HomePage'
import ResultsPage from './pages/ResultsPage/ResultsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}

export default App
