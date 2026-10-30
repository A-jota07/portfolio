import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

export function CursorSpotlight() {
  const prefersReducedMotion = useReducedMotion()
  const [hasFinePointer, setHasFinePointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springX = useSpring(cursorX, { stiffness: 420, damping: 32, mass: 0.4 })
  const springY = useSpring(cursorY, { stiffness: 420, damping: 32, mass: 0.4 })

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(pointer: fine)')
    setHasFinePointer(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setHasFinePointer(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!hasFinePointer || prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)

      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`)

      const target = e.target as HTMLElement | null
      const interactive = target?.closest('a, button, input, textarea, [role="button"]')
      setIsHoveringInteractive(Boolean(interactive))
    }

    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hasFinePointer, prefersReducedMotion, cursorX, cursorY, isVisible])

  if (!hasFinePointer || prefersReducedMotion || !isVisible) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isHoveringInteractive ? 1.55 : 1,
        opacity: isHoveringInteractive ? 0.85 : 0.55,
      }}
      transition={{ duration: 0.18 }}
      className="pointer-events-none fixed top-0 left-0 z-[70] hidden h-7 w-7 rounded-full border border-accent-400/60 bg-accent-400/10 backdrop-blur-[1px] lg:block"
    />
  )
}
