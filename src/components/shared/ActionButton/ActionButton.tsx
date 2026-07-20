import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactElement } from 'react'
import Button, { type ButtonVariant } from '../Button/Button'
import styles from './ActionButton.module.css'

export type ActionButtonProps = {
  label: string
  icon?: LucideIcon
  variant?: ButtonVariant
  ariaLabel?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>

function ActionButton({
  label,
  icon: Icon,
  variant = 'primary',
  ariaLabel,
  className,
  ...rest
}: ActionButtonProps): ReactElement {
  return (
    <Button
      variant={variant}
      ariaLabel={ariaLabel}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    >
      {Icon ? <Icon className={styles.icon} aria-hidden="true" size={20} /> : null}
      <span>{label}</span>
    </Button>
  )
}

export default ActionButton
