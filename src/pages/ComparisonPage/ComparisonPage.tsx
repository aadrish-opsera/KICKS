import { useEffect, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ComparisonTable from '../../components/ComparisonTable/ComparisonTable'
import { useComparisonContext } from '../../context/ComparisonContext'
import styles from './ComparisonPage.module.css'

function ComparisonPage(): ReactElement {
  const navigate = useNavigate()
  const { selectedSneakers, aiRankingAvailable } = useComparisonContext()

  useEffect(() => {
    document.title = 'Compare Sneakers'
    return () => {
      document.title = 'KICKS'
    }
  }, [])

  if (selectedSneakers.length < 2) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Compare Your Picks</h1>
        <div className={styles.empty} role="status">
          <p>
            No sneakers selected for comparison. Go back to results to pick your favorites!
          </p>
          <Link className={styles.back} to="/results">
            Back to Results
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/results')}
          aria-label="Back to Results"
        >
          <span aria-hidden="true">←</span> Back to Results
        </button>
        <h1 className={styles.title}>Compare Your Picks</h1>
      </header>
      <ComparisonTable
        sneakers={selectedSneakers}
        aiRankingAvailable={aiRankingAvailable}
      />
    </main>
  )
}

export default ComparisonPage
