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
    'bg-surface-900 text-white shadow-soft hover:bg-surface-800 hover:shadow-elevated',
  secondary:
    'bg-white text-surface-900 border border-surface-200 shadow-sm hover:bg-surface-100 hover:border-surface-300',
  ghost: 'text-surface-700 hover:bg-surface-100 hover:text-surface-900',
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
  const isInteractive = !disabled && !isLoading

  return (
    <motion.button
      whileHover={isInteractive ? { scale: 1.03 } : undefined}
      whileTap={isInteractive ? { scale: 0.96 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
        isInteractive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
      } ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </motion.button>
  )
}
