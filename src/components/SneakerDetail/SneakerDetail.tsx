import { useEffect, useId, useRef, useState, type ReactElement } from 'react'
import type { Sneaker } from '../../shared/types/sneaker'
import placeholderImage from '../../assets/sneaker-placeholder.svg'
import { COMPARISON } from '../../constants/uiText'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { formatCurrency } from '../../utils/formatCurrency'
import { sanitizeInput } from '../../utils/sanitize'
import Image from '../shared/Image/Image'
import styles from './SneakerDetail.module.css'

export type SneakerDetailProps = {
  sneaker: Sneaker
  isOpen: boolean
  onClose: () => void
}

function SneakerDetail({ sneaker, isOpen, onClose }: SneakerDetailProps): ReactElement | null {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [imageFailed, setImageFailed] = useState(false)
  useFocusTrap(dialogRef, isOpen)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const explanation = sneaker.aiExplanation
    ? sanitizeInput(sneaker.aiExplanation)
    : COMPARISON.aiUnavailableDetail
  const hasResale =
    (sneaker.resalePrice != null && sneaker.resalePrice > 0) ||
    sneaker.resaleLinks.length > 0
  const imageSrc = imageFailed || !sneaker.imageUrl ? placeholderImage : sneaker.imageUrl

  return (
    <div className={styles.backdrop} onClick={onClose} data-testid="detail-backdrop">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close details"
        >
          ×
        </button>
        <Image
          className={styles.image}
          src={imageSrc}
          alt={`${sneaker.name} by ${sneaker.brand}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        <h2 id={titleId} className={styles.title}>
          {sneaker.name}
        </h2>
        <p className={styles.subtitle}>
          {sneaker.brand} · {sneaker.colorway}
        </p>
        <p className={styles.price}>Retail: {formatCurrency(sneaker.retailPrice)}</p>
        {sneaker.resalePrice != null && sneaker.resalePrice > 0 ? (
          <p className={styles.price}>Resale: {formatCurrency(sneaker.resalePrice)}</p>
        ) : null}
        <p className={styles.explanation}>{explanation}</p>
        {hasResale ? (
          <ul className={styles.links}>
            {sneaker.resaleLinks.map((link) => (
              <li key={`${link.platform}-${link.url}`}>
                <a
                  className={styles.link}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Buy on ${link.platform}, opens in new tab`}
                >
                  Buy on {link.platform}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.fallback}>Resale info not available</p>
        )}
      </div>
    </div>
  )
}

export default SneakerDetail
