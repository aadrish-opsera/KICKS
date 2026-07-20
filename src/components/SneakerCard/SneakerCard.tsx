import { useState, type ReactElement } from 'react'
import type { Sneaker } from '../../shared/types/sneaker'
import { sanitizeInput } from '../../utils/sanitize'
import placeholderImage from '../../assets/sneaker-placeholder.svg'
import styles from './SneakerCard.module.css'

export type SneakerCardProps = {
  sneaker: Sneaker
  rank: number
  isSelected?: boolean
  selectable?: boolean
  onSelect?: (sneakerId: string, selected: boolean) => void
  onToggle?: (sneakerId: string) => void
  onViewDetails?: (sneaker: Sneaker) => void
}

function formatPrice(price: number | undefined): string {
  if (price === undefined || price <= 0) {
    return 'Price unavailable'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function SneakerCard({
  sneaker,
  rank,
  isSelected = false,
  selectable = true,
  onSelect,
  onToggle,
  onViewDetails,
}: SneakerCardProps): ReactElement {
  const [imageFailed, setImageFailed] = useState(false)
  const imageSrc = imageFailed || !sneaker.imageUrl ? placeholderImage : sneaker.imageUrl
  const explanation = sneaker.aiExplanation
    ? sanitizeInput(sneaker.aiExplanation)
    : 'No explanation available'
  const altText = `${sneaker.name} - ${sneaker.brand}`

  const handleImageError = (): void => {
    setImageFailed(true)
  }

  const handleToggle = (): void => {
    if (onToggle) {
      onToggle(sneaker.id)
      return
    }
    onSelect?.(sneaker.id, !isSelected)
  }

  return (
    <article className={isSelected ? `${styles.card} ${styles.selected}` : styles.card}>
      <div className={styles.header}>
        <span className={styles.rank} aria-label={`Rank ${rank}`}>
          {rank}
        </span>
        {selectable ? (
          <label className={styles.selectLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isSelected}
              onChange={handleToggle}
              aria-label={`Select ${sneaker.name} for comparison`}
            />
            <span>Compare</span>
          </label>
        ) : null}
      </div>
      <div className={styles.imageWrap}>
        <img
          className={styles.image}
          src={imageSrc}
          alt={altText}
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{sneaker.name}</h3>
        <p className={styles.meta}>
          {sneaker.brand} · {sneaker.colorway}
        </p>
        <p className={styles.price}>{formatPrice(sneaker.retailPrice)}</p>
        <p className={styles.explanation}>{explanation}</p>
        {onViewDetails ? (
          <button
            type="button"
            className={styles.details}
            onClick={() => onViewDetails(sneaker)}
          >
            View Details
          </button>
        ) : null}
        {sneaker.resaleLinks.length > 0 ? (
          <ul className={styles.links}>
            {sneaker.resaleLinks.map((link) => (
              <li key={`${link.platform}-${link.url}`}>
                <a
                  className={styles.link}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy on {link.platform}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noLinks}>No resale links available</p>
        )}
      </div>
    </article>
  )
}

export default SneakerCard
