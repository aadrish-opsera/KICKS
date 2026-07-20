import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import styles from './IconButton.module.css'

export type IconButtonProps = {
  children: ReactNode
  ariaLabel: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>

function IconButton({
  children,
  ariaLabel,
  className,
  type = 'button',
  ...rest
}: IconButtonProps): ReactElement {
  const classes = className ? `${styles.button} ${className}` : styles.button
  return (
    <button type={type} className={classes} aria-label={ariaLabel} {...rest}>
      <span className={styles.icon} aria-hidden="true">
        {children}
      </span>
    </button>
  )
}

export default IconButton
