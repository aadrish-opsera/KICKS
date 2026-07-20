import { useEffect, useState, type FormEvent, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import BudgetSelector from '../../components/BudgetSelector/BudgetSelector'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton'
import PreferenceInput from '../../components/PreferenceInput/PreferenceInput'
import { useRecommendation } from '../../hooks/useRecommendation'
import { DEFAULT_BUDGET, type BudgetRange } from '../../types/budget'
import styles from './HomePage.module.css'

function HomePage(): ReactElement {
  const navigate = useNavigate()
  const { data, error, isLoading, submit, retry } = useRecommendation()
  const [preferences, setPreferences] = useState('')
  const [preferencesValid, setPreferencesValid] = useState(false)
  const [budget, setBudget] = useState<BudgetRange>({ ...DEFAULT_BUDGET })

  useEffect(() => {
    if (data) {
      navigate('/results', { state: { recommendation: data } })
    }
  }, [data, navigate])

  const canSubmit = preferencesValid && !isLoading

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }
    await submit(preferences.trim(), budget)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>KICKS</p>
        <h1 className={styles.title}>Find sneakers you will love</h1>
        <p className={styles.subtitle}>
          Tell us what you like and your budget. We will show five great matches.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <PreferenceInput
          value={preferences}
          onChange={setPreferences}
          onValidationChange={setPreferencesValid}
          disabled={isLoading}
        />
        <BudgetSelector value={budget} onChange={setBudget} disabled={isLoading} />
        <button type="submit" className={styles.submit} disabled={!canSubmit}>
          <span aria-hidden="true">🔎</span>
          {isLoading ? 'Finding sneakers...' : 'Find My Sneakers'}
        </button>
      </form>

      {isLoading ? <LoadingSkeleton /> : null}
      {error ? <ErrorState errorCode={error.code} onRetry={() => void retry()} /> : null}
    </main>
  )
}

export default HomePage
