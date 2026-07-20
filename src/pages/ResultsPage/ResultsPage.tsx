import { useMemo, useState, type ReactElement } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import CompareButton from '../../components/CompareButton/CompareButton'
import EmptyFilterState from '../../components/EmptyFilterState/EmptyFilterState'
import ErrorState from '../../components/ErrorState/ErrorState'
import FilterControls from '../../components/FilterControls/FilterControls'
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton'
import QuotaBanner from '../../components/QuotaBanner/QuotaBanner'
import SneakerCard from '../../components/SneakerCard/SneakerCard'
import SneakerDetail from '../../components/SneakerDetail/SneakerDetail'
import { useComparisonContext } from '../../context/ComparisonContext'
import { useComparisonSelection } from '../../hooks/useComparisonSelection'
import { useFilteredSneakers } from '../../hooks/useFilteredSneakers'
import type { RecommendationResponse } from '../../shared/types/recommendation'
import type { Sneaker } from '../../shared/types/sneaker'
import { EMPTY_FILTER_STATE, type FilterState } from '../../types/filters'
import styles from './ResultsPage.module.css'

type ResultsLocationState = {
  recommendation?: RecommendationResponse
  errorCode?: string
  loading?: boolean
}

function ResultsPage(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const { setComparison } = useComparisonContext()
  const state = (location.state ?? {}) as ResultsLocationState
  const recommendation = state.recommendation

  const selection = useComparisonSelection()
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTER_STATE })
  const [detailSneaker, setDetailSneaker] = useState<Sneaker | null>(null)

  const sneakers = useMemo(
    () => recommendation?.sneakers ?? [],
    [recommendation?.sneakers],
  )
  const filteredSneakers = useFilteredSneakers(sneakers, filters)

  if (state.loading) {
    return (
      <main className={styles.page}>
        <LoadingSkeleton />
      </main>
    )
  }

  if (state.errorCode) {
    return (
      <main className={styles.page}>
        <ErrorState errorCode={state.errorCode} onRetry={() => navigate('/')} />
      </main>
    )
  }

  if (!recommendation) {
    return <Navigate to="/" replace />
  }

  const selectedSneakers = sneakers.filter((item) => selection.isSelected(item.id))
  const tooFewForCompare = sneakers.length < 2

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your top matches</h1>
        <p className={styles.subtitle}>Pick 2 or 3 sneakers to compare side by side.</p>
      </header>

      <QuotaBanner aiRankingAvailable={recommendation.aiRankingAvailable} />

      <FilterControls sneakers={sneakers} filters={filters} onChange={setFilters} />

      {filteredSneakers.length === 0 ? (
        <EmptyFilterState onClear={() => setFilters({ ...EMPTY_FILTER_STATE })} />
      ) : (
        <div className={styles.grid}>
          {filteredSneakers.map((sneaker, index) => (
            <SneakerCard
              key={sneaker.id}
              sneaker={sneaker}
              rank={index + 1}
              selectable
              isSelected={selection.isSelected(sneaker.id)}
              onToggle={selection.toggleSelection}
              onViewDetails={setDetailSneaker}
            />
          ))}
        </div>
      )}

      {tooFewForCompare ? (
        <p className={styles.selectionMessage}>Need at least 2 sneakers to compare.</p>
      ) : null}
      {selection.limitMessage ? (
        <p className={styles.selectionMessage}>{selection.limitMessage}</p>
      ) : null}

      <CompareButton
        selectionCount={selection.selectionCount}
        disabled={tooFewForCompare}
        onClick={() => {
          setComparison(selectedSneakers, recommendation.aiRankingAvailable)
          navigate('/comparison')
        }}
      />

      {detailSneaker ? (
        <SneakerDetail
          sneaker={detailSneaker}
          isOpen={true}
          onClose={() => setDetailSneaker(null)}
        />
      ) : null}
    </main>
  )
}

export default ResultsPage
