import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'icon'

export type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  ariaLabel?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

function Button({
  children,
  variant = 'primary',
  ariaLabel,
  className,
  type = 'button',
  ...rest
}: ButtonProps): ReactElement {
  const variantClass =
    variant === 'secondary'
      ? styles.secondary
      : variant === 'icon'
        ? styles.icon
        : styles.primary
  const classes = className
    ? `${styles.button} ${variantClass} ${className}`
    : `${styles.button} ${variantClass}`

  return (
    <button type={type} className={classes} aria-label={ariaLabel} {...rest}>
      {children}
    </button>
  )
}

export default Button
