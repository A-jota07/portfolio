import { useEffect, useRef, useState } from 'react'

export function CursorSpotlight() {
  const glowRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let rafId: number | null = null
    let targetX = -1000
    let targetY = -1000

    const updateGlow = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${targetX - 220}px, ${targetY - 220}px, 0)`
      }
      rafId = null
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`)

      if (!isVisible) {
        setIsVisible(true)
      }

      if (!rafId) {
        rafId = window.requestAnimationFrame(updateGlow)
      }
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isVisible])

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-20 hidden lg:block rounded-full will-change-transform"
      style={{
        width: '440px',
        height: '440px',
        transform: 'translate3d(-1000px, -1000px, 0)',
        background:
          'radial-gradient(circle at center, oklch(0.72 var(--palette-chroma, 0.22) var(--active-hue) / 0.16) 0%, oklch(0.68 var(--palette-chroma, 0.22) var(--active-sec-hue) / 0.07) 42%, transparent 70%)',
        filter: 'blur(36px)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    />
  )
}
