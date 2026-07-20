import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ComparisonPage from './pages/ComparisonPage'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
