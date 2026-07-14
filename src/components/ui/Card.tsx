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
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`overflow-hidden rounded-2xl border border-surface-200/80 bg-white/70 shadow-soft backdrop-blur-sm ${hoverZoom ? 'group cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
