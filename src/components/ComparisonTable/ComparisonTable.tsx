import { useState, type ReactElement } from 'react'
import type { Sneaker } from '../../shared/types/sneaker'
import placeholderImage from '../../assets/sneaker-placeholder.svg'
import { COMPARISON } from '../../constants/uiText'
import { formatCurrency } from '../../utils/formatCurrency'
import { sanitizeInput } from '../../utils/sanitize'
import Image from '../shared/Image/Image'
import styles from './ComparisonTable.module.css'

export type ComparisonTableProps = {
  sneakers: readonly Sneaker[]
  aiRankingAvailable: boolean
}

function ComparisonTable({
  sneakers,
  aiRankingAvailable,
}: ComparisonTableProps): ReactElement {
  const columns = sneakers.slice(0, 3)

  return (
    <div
      className={styles.root}
      role="table"
      aria-label="Sneaker comparison table"
    >
      {!aiRankingAvailable ? (
        <p className={styles.degraded} role="status">
          {COMPARISON.aiUnavailable}
        </p>
      ) : null}

      <div className={styles.scroll}>
        <div
          className={styles.grid}
          style={{ ['--compare-cols' as string]: String(columns.length) }}
        >
          <div className={styles.row} role="row">
            <div className={styles.label} role="rowheader">
              <span aria-hidden="true">🖼️</span> Image
            </div>
            {columns.map((sneaker) => (
              <ComparisonImage key={`img-${sneaker.id}`} sneaker={sneaker} />
            ))}
          </div>

          <AttributeRow label="Name" icon="🏷️">
            {columns.map((sneaker) => (
              <div key={`name-${sneaker.id}`} className={styles.cell} role="cell">
                {sneaker.name}
              </div>
            ))}
          </AttributeRow>

          <AttributeRow label="Brand" icon="🏢">
            {columns.map((sneaker) => (
              <div key={`brand-${sneaker.id}`} className={styles.cell} role="cell">
                {sneaker.brand}
              </div>
            ))}
          </AttributeRow>

          <AttributeRow label="Colorway" icon="🎨">
            {columns.map((sneaker) => (
              <div key={`color-${sneaker.id}`} className={styles.cell} role="cell">
                {sneaker.colorway}
              </div>
            ))}
          </AttributeRow>

          <AttributeRow label="Price" icon="$">
            {columns.map((sneaker) => (
              <div key={`price-${sneaker.id}`} className={styles.cell} role="cell">
                {formatCurrency(sneaker.retailPrice)}
                {sneaker.resalePrice != null && sneaker.resalePrice > 0
                  ? ` (resale ${formatCurrency(sneaker.resalePrice)})`
                  : ''}
              </div>
            ))}
          </AttributeRow>

          <AttributeRow label="AI rating" icon="⭐">
            {columns.map((sneaker) => (
              <div key={`rating-${sneaker.id}`} className={styles.cell} role="cell">
                {aiRankingAvailable && sneaker.aiRating != null
                  ? String(sneaker.aiRating)
                  : COMPARISON.aiUnavailable}
              </div>
            ))}
          </AttributeRow>

          <AttributeRow label="Why it fits" icon="💡">
            {columns.map((sneaker) => (
              <div key={`why-${sneaker.id}`} className={`${styles.cell} ${styles.explanation}`} role="cell">
                {aiRankingAvailable && sneaker.aiExplanation
                  ? sanitizeInput(sneaker.aiExplanation)
                  : COMPARISON.aiUnavailable}
              </div>
            ))}
          </AttributeRow>
        </div>
      </div>
      <div className={styles.scrollHint} aria-hidden="true" />
    </div>
  )
}

function AttributeRow({
  label,
  icon,
  children,
}: {
  label: string
  icon: string
  children: ReactElement[]
}): ReactElement {
  return (
    <div className={styles.row} role="row">
      <div className={styles.label} role="rowheader">
        <span aria-hidden="true">{icon}</span> {label}
      </div>
      {children}
    </div>
  )
}

function ComparisonImage({ sneaker }: { sneaker: Sneaker }): ReactElement {
  const [failed, setFailed] = useState(false)
  const src = failed || !sneaker.imageUrl ? placeholderImage : sneaker.imageUrl
  return (
    <div className={styles.cell} role="cell">
      <Image
        className={styles.image}
        src={src}
        alt={`${sneaker.name} by ${sneaker.brand}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default ComparisonTable
