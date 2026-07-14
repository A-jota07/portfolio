import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  isLoading?: boolean
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-button text-surface-50 shadow-soft hover:shadow-elevated hover:brightness-110',
  secondary:
    'bg-surface-100 text-surface-700 border border-surface-200 hover:bg-surface-200',
  ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-800',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
}

export function Button({
  variant = 'primary',
  isLoading,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </motion.button>
  )
}
