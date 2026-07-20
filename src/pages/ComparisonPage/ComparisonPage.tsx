import { useEffect, type ReactElement } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ComparisonTable from '../../components/ComparisonTable/ComparisonTable'
import ActionButton from '../../components/shared/ActionButton/ActionButton'
import { COMPARISON } from '../../constants/uiText'
import { useComparisonContext } from '../../context/ComparisonContext'
import PageLayout from '../../layouts/PageLayout'
import styles from './ComparisonPage.module.css'

function ComparisonPage(): ReactElement {
  const navigate = useNavigate()
  const { selectedSneakers, aiRankingAvailable } = useComparisonContext()

  useEffect(() => {
    document.title = COMPARISON.documentTitle
    return () => {
      document.title = 'KICKS'
    }
  }, [])

  if (selectedSneakers.length < 2) {
    return (
      <PageLayout className={styles.page}>
        <h1 className={styles.title}>{COMPARISON.heading}</h1>
        <div className={styles.empty} role="status">
          <p>{COMPARISON.emptyMessage}</p>
          <Link className={styles.back} to="/results">
            {COMPARISON.backButton}
          </Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout className={styles.page}>
      <header className={styles.header}>
        <ActionButton
          className={styles.back}
          variant="secondary"
          icon={ArrowLeft}
          label={COMPARISON.backButton}
          ariaLabel={COMPARISON.backButton}
          onClick={() => navigate('/results')}
        />
        <h1 className={styles.title}>{COMPARISON.heading}</h1>
      </header>
      <section className={styles.compareRegion} aria-label={COMPARISON.regionLabel}>
        <ComparisonTable
          sneakers={selectedSneakers}
          aiRankingAvailable={aiRankingAvailable}
        />
      </section>
    </PageLayout>
  )
}

export default ComparisonPage
