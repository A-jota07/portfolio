import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hoverZoom?: boolean
  spotlight?: boolean
}

export function Card({
  children,
  className = '',
  hoverZoom = false,
  spotlight = true,
}: CardProps) {
  const prefersReducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight || prefersReducedMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    })
  }

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }))
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverZoom && !prefersReducedMotion ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`bento-card overflow-hidden rounded-2xl ${
        hoverZoom ? 'group cursor-pointer' : ''
      } ${className}`}
    >
      {spotlight && mousePos.active && !prefersReducedMotion && (
        <div
          className="pointer-events-none absolute -inset-px z-10 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, var(--accent-glow), transparent 65%)`,
          }}
        />
      )}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  )
}
