import { useEffect, useRef } from 'react'

export function CursorSpotlight() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId: number | null = null
    let targetX = -1000
    let targetY = -1000
    let isVisible = false

    const updateGlow = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${targetX - 220}px, ${targetY - 220}px, 0)`
        if (!isVisible) {
          glowRef.current.style.opacity = '1'
          isVisible = true
        }
      }
      // Sincroniza as variáveis CSS no elemento raiz dentro do frame de animação
      document.documentElement.style.setProperty('--cursor-x', `${targetX}px`)
      document.documentElement.style.setProperty('--cursor-y', `${targetY}px`)
      rafId = null
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      if (!rafId) {
        rafId = window.requestAnimationFrame(updateGlow)
      }
    }

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = '0'
      }
      isVisible = false
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, []) // Dependência vazia: zero remontagens desnecessárias de listeners

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-20 hidden lg:block rounded-full will-change-transform opacity-0 transition-opacity duration-300"
      style={{
        width: '440px',
        height: '440px',
        transform: 'translate3d(-1000px, -1000px, 0)',
        background:
          'radial-gradient(circle at center, oklch(0.72 var(--palette-chroma, 0.22) var(--active-hue) / 0.16) 0%, oklch(0.68 var(--palette-chroma, 0.22) var(--active-sec-hue) / 0.07) 42%, transparent 70%)',
        filter: 'blur(36px)',
      }}
    />
  )
}
