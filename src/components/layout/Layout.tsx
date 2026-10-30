import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { StatusBar } from './StatusBar'
import { CommandPalette } from './CommandPalette'
import { CursorSpotlight } from './CursorSpotlight'

export function Layout() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [location.pathname, prefersReducedMotion])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-calm bg-ide-grid">
      <div className="noise-overlay" aria-hidden="true" />
      <CursorSpotlight />
      <Navbar />
      <CommandPalette />

      <main id="conteudo-principal" className="relative z-10 flex-1 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <StatusBar />
    </div>
  )
}
