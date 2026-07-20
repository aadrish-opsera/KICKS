import { useMemo, useState, type ReactElement } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton'
import QuotaBanner from '../../components/QuotaBanner/QuotaBanner'
import SneakerCard from '../../components/SneakerCard/SneakerCard'
import type { RecommendationResponse } from '../../shared/types/recommendation'
import type { Sneaker } from '../../shared/types/sneaker'
import styles from './ResultsPage.module.css'

type ResultsLocationState = {
  recommendation?: RecommendationResponse
  errorCode?: string
  loading?: boolean
}

function ResultsPage(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as ResultsLocationState
  const recommendation = state.recommendation

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null)
  const [brandFilter, setBrandFilter] = useState('all')
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null)

  const sneakers = recommendation?.sneakers ?? []

  const brands = useMemo(() => {
    return Array.from(new Set(sneakers.map((item) => item.brand))).sort()
  }, [sneakers])

  const filteredSneakers = useMemo(() => {
    return sneakers.filter((item) => {
      if (brandFilter !== 'all' && item.brand !== brandFilter) {
        return false
      }
      if (maxPriceFilter !== null && item.retailPrice > maxPriceFilter) {
        return false
      }
      return true
    })
  }, [sneakers, brandFilter, maxPriceFilter])

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

  const handleSelect = (sneakerId: string, selected: boolean): void => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (!selected) {
        next.delete(sneakerId)
        setSelectionMessage(null)
        return next
      }
      if (next.size >= 3 && !next.has(sneakerId)) {
        setSelectionMessage('Please deselect one sneaker before adding another')
        return previous
      }
      next.add(sneakerId)
      setSelectionMessage(null)
      return next
    })
  }

  const selectedSneakers: Sneaker[] = sneakers.filter((item) => selectedIds.has(item.id))
  const canCompare = selectedSneakers.length >= 2 && selectedSneakers.length <= 3

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your top matches</h1>
        <p className={styles.subtitle}>Pick 2 or 3 sneakers to compare side by side.</p>
      </header>

      <QuotaBanner aiRankingAvailable={recommendation.aiRankingAvailable} />

      <div className={styles.filters}>
        <label className={styles.filterLabel}>
          Brand
          <select
            className={styles.select}
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
          >
            <option value="all">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterLabel}>
          Max price
          <select
            className={styles.select}
            value={maxPriceFilter ?? 'all'}
            onChange={(event) => {
              const value = event.target.value
              setMaxPriceFilter(value === 'all' ? null : Number(value))
            }}
          >
            <option value="all">Any price</option>
            <option value="100">Up to $100</option>
            <option value="150">Up to $150</option>
            <option value="200">Up to $200</option>
          </select>
        </label>
      </div>

      {filteredSneakers.length === 0 ? (
        <div className={styles.empty}>
          <p>No sneakers match your filters. Try adjusting your selection.</p>
          <button
            type="button"
            className={styles.clearFilters}
            onClick={() => {
              setBrandFilter('all')
              setMaxPriceFilter(null)
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSneakers.map((sneaker, index) => (
            <SneakerCard
              key={sneaker.id}
              sneaker={sneaker}
              rank={index + 1}
              isSelected={selectedIds.has(sneaker.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {selectionMessage ? <p className={styles.selectionMessage}>{selectionMessage}</p> : null}

      {canCompare ? (
        <button
          type="button"
          className={styles.compare}
          onClick={() =>
            navigate('/comparison', {
              state: { sneakers: selectedSneakers },
            })
          }
        >
          Compare Selected ({selectedSneakers.length})
        </button>
      ) : null}
    </main>
  )
}

export default ResultsPage
