import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  isLoading?: boolean
  magnetic?: boolean
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-gradient text-white shadow-soft hover:brightness-110 border border-accent-400/30 border-glow',
  secondary:
    'bg-surface-100/90 text-surface-900 border border-surface-200 shadow-sm hover:bg-surface-200/80 hover:border-accent-400/50',
  ghost:
    'text-surface-600 hover:bg-surface-200/50 hover:text-surface-900 border border-transparent',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
}

export function Button({
  variant = 'primary',
  isLoading,
  magnetic = true,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isInteractive = !disabled && !isLoading
  const prefersReducedMotion = useReducedMotion()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isInteractive || !magnetic || prefersReducedMotion || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * 0.16
    const deltaY = (e.clientY - centerY) * 0.16
    setOffset({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 })
  }

  return (
    <motion.button
      ref={buttonRef}
      animate={
        !prefersReducedMotion && magnetic
          ? { x: offset.x, y: offset.y }
          : undefined
      }
      whileHover={isInteractive && !prefersReducedMotion ? { scale: 1.02 } : undefined}
      whileTap={isInteractive && !prefersReducedMotion ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 20, mass: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
        isInteractive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
      } ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Executando...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
