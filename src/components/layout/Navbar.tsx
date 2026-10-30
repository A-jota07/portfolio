import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import {
  Command,
  FileCode2,
  FolderGit2,
  Mail,
  Menu,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Terminal,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PALETTE_OPTIONS, useTheme } from '@/context/ThemeContext'

const navTabs = [
  { to: '/', label: '_inicio.tsx', shortLabel: '_inicio', icon: FileCode2 },
  { to: '/portfolio', label: '_projetos.ts', shortLabel: '_projetos', icon: FolderGit2 },
  { to: '/contato', label: '_contato.sh', shortLabel: '_contato', icon: Mail },
]

function resolveBreadcrumb(pathname: string, activeSection: string): string {
  if (pathname === '/') {
    return `~/portfolio/inicio${activeSection && activeSection !== 'inicio' ? `/${activeSection}` : ''}`
  }
  if (pathname === '/portfolio') {
    return '~/portfolio/projetos'
  }
  if (pathname.startsWith('/portfolio/')) {
    const slug = pathname.replace('/portfolio/', '')
    return `~/portfolio/projetos/${slug}.md`
  }
  if (pathname === '/contato') {
    return '~/portfolio/contato'
  }
  return `~/portfolio${pathname}`
}

export function Navbar() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const {
    mode,
    palette,
    activeSection,
    toggleMode,
    setPalette,
    openCommandPalette,
  } = useTheme()
  const prefersReducedMotion = useReducedMotion()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  const isAdmin = location.pathname.startsWith('/admin')
  if (isAdmin) return null

  const breadcrumb = resolveBreadcrumb(location.pathname, activeSection)

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200/80 bg-surface-50/85 backdrop-blur-xl">
      {/* Barra de progresso de leitura no topo */}
      <motion.div
        style={{ scaleX: prefersReducedMotion ? scrollYProgress : scaleX }}
        className="h-[2px] w-full origin-left bg-accent-gradient"
      />

      {/* Skip link para acessibilidade via teclado */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-accent-500 focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-bold focus:text-white"
      >
        Pular para o conteúdo principal
      </a>

      <nav
        aria-label="Navegação principal estilo IDE"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
      >
        {/* Identidade Terminal + Breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-2.5 rounded-xl border border-surface-200 bg-surface-100/80 px-3 py-1.5 transition-colors hover:border-accent-400/50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-gradient text-white shadow-sm">
              <Terminal className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-sm font-bold tracking-tight text-surface-900">
              alexandre<span className="text-accent-400">.dev</span>
            </span>
          </Link>

          <div
            className="hidden items-center gap-1.5 truncate rounded-lg border border-surface-200/60 bg-surface-100/40 px-2.5 py-1 font-mono text-xs text-surface-500 lg:flex"
            title={breadcrumb}
          >
            <span className="text-accent-400">&gt;</span>
            <span className="truncate">{breadcrumb}</span>
          </div>
        </div>

        {/* Abas de arquivo estilo IDE (Desktop) */}
        <ul className="hidden items-center gap-1 rounded-xl border border-surface-200/80 bg-surface-100/60 p-1 md:flex">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isTabActive =
              tab.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(tab.to)

            return (
              <li key={tab.to} className="relative">
                <NavLink
                  to={tab.to}
                  className={`relative z-10 flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-medium transition-colors duration-200 ${
                    isTabActive
                      ? 'text-surface-900'
                      : 'text-surface-500 hover:text-surface-800'
                  }`}
                >
                  {isTabActive && (
                    <motion.span
                      layoutId="ide-active-tab"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-lg border border-accent-400/40 bg-surface-50 shadow-sm"
                    />
                  )}
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isTabActive ? 'text-accent-400' : 'text-surface-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {isTabActive && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-accent-400"
                      aria-hidden="true"
                    />
                  )}
                </NavLink>
              </li>
            )
          })}

          {isAuthenticated && (
            <li>
              <NavLink
                to="/admin"
                className="ml-1 flex items-center gap-1.5 rounded-lg border border-accent-400/30 bg-accent-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-accent-400 transition-colors hover:bg-accent-500/20"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>_admin</span>
              </NavLink>
            </li>
          )}
        </ul>

        {/* Ações Rápidas: Paleta Ctrl+K, Seletor de Tema e Modo Claro/Escuro */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Abrir paleta de comandos (Ctrl+K)"
            className="flex min-h-[40px] items-center gap-2 rounded-xl border border-surface-200 bg-surface-100/80 px-3 py-1.5 font-mono text-xs text-surface-600 transition-colors hover:border-accent-400/50 hover:text-surface-900 cursor-pointer"
          >
            <Command className="h-3.5 w-3.5 text-accent-400" />
            <span className="hidden sm:inline">Comandos</span>
            <kbd className="hidden rounded border border-surface-300 bg-surface-50 px-1.5 py-0.5 text-[10px] font-semibold text-surface-500 sm:inline-block">
              Ctrl K
            </kbd>
          </button>

          {/* Seletor rápido de Paleta */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPaletteMenuOpen((prev) => !prev)}
              aria-label="Escolher paleta de cores"
              aria-expanded={paletteMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-surface-100/80 text-surface-600 transition-colors hover:border-accent-400/50 hover:text-surface-900 cursor-pointer"
            >
              <Palette className="h-4 w-4 text-accent-400" />
            </button>

            <AnimatePresence>
              {paletteMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPaletteMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="glass-panel absolute right-0 z-50 mt-2 w-56 rounded-2xl p-2 shadow-elevated"
                  >
                    <p className="px-2.5 py-1.5 font-mono text-[11px] text-surface-400">
                      // paleta_de_acento
                    </p>
                    <div className="space-y-1">
                      {PALETTE_OPTIONS.map((opt) => {
                        const active = palette === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setPalette(opt.id)
                              setPaletteMenuOpen(false)
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-mono text-xs transition-colors cursor-pointer ${
                              active
                                ? 'bg-surface-200/80 font-semibold text-surface-900'
                                : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className="h-3 w-3 rounded-full border border-white/20"
                                style={{ background: opt.swatch }}
                              />
                              <span>{opt.label}</span>
                            </span>
                            {active && <span className="text-accent-400">●</span>}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Modo Escuro / Claro */}
          <button
            type="button"
            onClick={toggleMode}
            aria-label={mode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-surface-100/80 text-surface-600 transition-colors hover:border-accent-400/50 hover:text-surface-900 cursor-pointer"
          >
            {mode === 'dark' ? (
              <Sun className="h-4 w-4 text-accent-400" />
            ) : (
              <Moon className="h-4 w-4 text-accent-500" />
            )}
          </button>

          {/* Botão Menu Mobile (Alvo mínimo 44px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-surface-200 bg-surface-100/80 text-surface-700 md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Drawer Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-surface-200 bg-surface-50/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              <div className="mb-2 rounded-lg border border-surface-200/70 bg-surface-100/60 px-3 py-2 font-mono text-xs text-surface-500">
                <span className="text-accent-400">&gt; </span>
                {breadcrumb}
              </div>

              {navTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-2.5 font-mono text-sm font-medium transition-colors ${
                        isActive
                          ? 'border border-accent-400/40 bg-surface-100 text-surface-900'
                          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 text-accent-400" />
                    <span>{tab.label}</span>
                  </NavLink>
                )
              })}

              {isAuthenticated && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl border border-accent-400/30 bg-accent-500/10 px-4 py-2.5 font-mono text-sm font-semibold text-accent-400"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>_admin</span>
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
