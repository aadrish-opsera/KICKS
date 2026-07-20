import { useId, useMemo, type ChangeEvent, type ReactElement } from 'react'
import { sanitizeInput } from '../../utils/sanitize'
import styles from './PreferenceInput.module.css'

export const PREFERENCE_MIN_LENGTH = 3
export const PREFERENCE_MAX_LENGTH = 500

export type PreferenceInputProps = {
  value: string
  onChange: (sanitized: string) => void
  onValidationChange: (isValid: boolean) => void
  disabled?: boolean
}

function countGraphemes(text: string): number {
  return Array.from(text).length
}

function PreferenceInput({
  value,
  onChange,
  onValidationChange,
  disabled = false,
}: PreferenceInputProps): ReactElement {
  const inputId = useId()
  const errorId = useId()
  const counterId = useId()

  const length = countGraphemes(value)
  const trimmedLength = countGraphemes(value.trim())
  const isTooShort = trimmedLength > 0 && trimmedLength < PREFERENCE_MIN_LENGTH
  const isEmpty = trimmedLength === 0
  const isTooLong = length > PREFERENCE_MAX_LENGTH

  const validationMessage = useMemo((): string | null => {
    if (isEmpty) {
      return null
    }
    if (isTooShort) {
      return 'Please describe what you are looking for (at least 3 characters)'
    }
    if (isTooLong) {
      return `Please keep your description under ${PREFERENCE_MAX_LENGTH} characters`
    }
    return null
  }, [isEmpty, isTooShort, isTooLong])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const raw = event.target.value
    const truncated =
      Array.from(raw).length > PREFERENCE_MAX_LENGTH
        ? Array.from(raw).slice(0, PREFERENCE_MAX_LENGTH).join('')
        : raw
    const sanitized = sanitizeInput(truncated)
    onChange(sanitized)

    const nextLength = countGraphemes(sanitized)
    const nextTrimmed = countGraphemes(sanitized.trim())
    const nextValid =
      nextTrimmed >= PREFERENCE_MIN_LENGTH && nextLength <= PREFERENCE_MAX_LENGTH
    onValidationChange(nextValid)
  }

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={inputId}>
        <span className={styles.labelIcon} aria-hidden="true">
          🔎
        </span>
        What kind of sneakers do you want?
      </label>
      <textarea
        id={inputId}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        rows={4}
        maxLength={PREFERENCE_MAX_LENGTH}
        placeholder="Try: blue Nike runners under $100"
        aria-invalid={Boolean(validationMessage)}
        aria-describedby={`${counterId}${validationMessage ? ` ${errorId}` : ''}`}
      />
      <div className={styles.meta}>
        <span id={counterId} className={styles.counter} aria-live="polite">
          {length} / {PREFERENCE_MAX_LENGTH}
        </span>
        {validationMessage ? (
          <p id={errorId} className={styles.error} role="alert">
            {validationMessage}
          </p>
        ) : (
          <span className={styles.errorPlaceholder} aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

export default PreferenceInput
