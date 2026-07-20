import { Search } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import BudgetSelector from '../../components/BudgetSelector/BudgetSelector'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton'
import PreferenceInput from '../../components/PreferenceInput/PreferenceInput'
import ActionButton from '../../components/shared/ActionButton/ActionButton'
import { HOME } from '../../constants/uiText'
import { useRecommendation } from '../../hooks/useRecommendation'
import PageLayout from '../../layouts/PageLayout'
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
    <PageLayout className={styles.page}>
      <header className={styles.header}>
        <p className={styles.brand}>{HOME.brand}</p>
        <h1 className={styles.title}>{HOME.heading}</h1>
        <p className={styles.subtitle}>{HOME.subheading}</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} aria-label={HOME.formLabel}>
        <PreferenceInput
          value={preferences}
          onChange={setPreferences}
          onValidationChange={setPreferencesValid}
          disabled={isLoading}
        />
        <BudgetSelector value={budget} onChange={setBudget} disabled={isLoading} />
        <ActionButton
          type="submit"
          icon={Search}
          label={isLoading ? HOME.submitLoading : HOME.submitButton}
          disabled={!canSubmit}
          className={styles.submit}
        />
      </form>

      {isLoading ? (
        <div aria-busy="true">
          <LoadingSkeleton />
        </div>
      ) : null}
      {error ? <ErrorState errorCode={error.code} onRetry={() => void retry()} /> : null}
    </PageLayout>
  )
}

export default HomePage
