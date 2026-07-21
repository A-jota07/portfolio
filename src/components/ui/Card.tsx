import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hoverZoom?: boolean
}

export function Card({ children, className = '', hoverZoom = false }: CardProps) {
  return (
    <motion.div
      whileHover={hoverZoom ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-soft transition-all duration-300 ${
        hoverZoom ? 'group cursor-pointer hover:border-surface-300 hover:shadow-elevated' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  )
}
