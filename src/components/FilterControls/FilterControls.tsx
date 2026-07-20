import { useMemo, type ReactElement } from 'react'
import type { Sneaker } from '../../shared/types/sneaker'
import { RESULTS } from '../../constants/uiText'
import { EMPTY_FILTER_STATE, type FilterState } from '../../types/filters'
import { formatCurrency } from '../../utils/formatCurrency'
import ActionButton from '../shared/ActionButton/ActionButton'
import { X } from 'lucide-react'
import styles from './FilterControls.module.css'

export type FilterControlsProps = {
  sneakers: readonly Sneaker[]
  filters: FilterState
  onChange: (next: FilterState) => void
}

function FilterControls({
  sneakers,
  filters,
  onChange,
}: FilterControlsProps): ReactElement {
  const brands = useMemo(() => {
    return Array.from(
      new Set(sneakers.map((item) => item.brand)),
    ).sort((a, b) => a.localeCompare(b))
  }, [sneakers])

  const priceBounds = useMemo(() => {
    if (sneakers.length === 0) {
      return { min: 0, max: 0 }
    }
    const prices = sneakers.map((item) => item.retailPrice)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [sneakers])

  const buckets = useMemo(() => {
    if (priceBounds.min === priceBounds.max) {
      return [] as Array<{ label: string; min: number; max: number }>
    }
    const mid = Math.round((priceBounds.min + priceBounds.max) / 2)
    return [
      {
        label: `Up to ${formatCurrency(mid)}`,
        min: priceBounds.min,
        max: mid,
      },
      {
        label: `${formatCurrency(mid)}+`,
        min: mid,
        max: priceBounds.max,
      },
    ]
  }, [priceBounds])

  return (
    <section className={styles.root} aria-label={RESULTS.filterRegion}>
      <div className={styles.group}>
        <p className={styles.heading}>
          <span aria-hidden="true">🏷️</span> {RESULTS.brandFilter}
        </p>
        <div className={styles.pills}>
          <button
            type="button"
            className={
              filters.brand == null ? `${styles.pill} ${styles.pillActive}` : styles.pill
            }
            onClick={() => onChange({ ...filters, brand: null })}
          >
            {RESULTS.allBrands}
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              className={
                filters.brand?.toLowerCase() === brand.toLowerCase()
                  ? `${styles.pill} ${styles.pillActive}`
                  : styles.pill
              }
              onClick={() => onChange({ ...filters, brand })}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <p className={styles.heading}>
          <span aria-hidden="true">$</span> {RESULTS.priceFilter}
        </p>
        {buckets.length === 0 ? (
          <p className={styles.hint}>{RESULTS.samePriceHint}</p>
        ) : (
          <div className={styles.pills}>
            <button
              type="button"
              className={
                filters.priceMax == null && filters.priceMin == null
                  ? `${styles.pill} ${styles.pillActive}`
                  : styles.pill
              }
              onClick={() =>
                onChange({ ...filters, priceMin: null, priceMax: null })
              }
            >
              {RESULTS.anyPrice}
            </button>
            {buckets.map((bucket) => {
              const active =
                filters.priceMin === bucket.min && filters.priceMax === bucket.max
              return (
                <button
                  key={bucket.label}
                  type="button"
                  className={active ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                  onClick={() =>
                    onChange({
                      ...filters,
                      priceMin: bucket.min,
                      priceMax: bucket.max,
                    })
                  }
                >
                  {bucket.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <ActionButton
        className={styles.clear}
        variant="secondary"
        icon={X}
        label={RESULTS.clearFilters}
        onClick={() => onChange({ ...EMPTY_FILTER_STATE })}
      />
    </section>
  )
}

export default FilterControls
