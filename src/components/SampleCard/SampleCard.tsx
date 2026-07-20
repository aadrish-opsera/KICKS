import styles from './SampleCard.module.css'

type SampleCardProps = {
  title: string
  body: string
  actionLabel?: string
}

function SampleCard({ title, body, actionLabel = 'Learn more' }: SampleCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      <button type="button" className={styles.action}>
        {actionLabel}
      </button>
    </article>
  )
}

export default SampleCard
