import type { ReactElement, ReactNode } from 'react'
import styles from './PageLayout.module.css'

export type PageLayoutProps = {
  children: ReactNode
  as?: 'main' | 'div'
  className?: string
}

function PageLayout({
  children,
  as = 'main',
  className,
}: PageLayoutProps): ReactElement {
  const Tag = as
  const classes = className ? `${styles.root} ${className}` : styles.root
  return <Tag className={classes}>{children}</Tag>
}

export default PageLayout
