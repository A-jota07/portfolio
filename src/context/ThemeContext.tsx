import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ThemeMode, ThemePalette } from '@/constants/theme'
import { ThemeContext } from '@/hooks/useTheme'

const MODE_STORAGE_KEY = 'portfolio_theme_mode'
const PALETTE_STORAGE_KEY = 'portfolio_theme_palette'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(MODE_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function getInitialPalette(): ThemePalette {
  if (typeof window === 'undefined') return 'neon'
  const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
  const valid: ThemePalette[] = ['neon', 'cyan', 'matrix', 'amber', 'magenta']
  if (stored && valid.includes(stored as ThemePalette)) {
    return stored as ThemePalette
  }
  return 'neon'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode)
  const [palette, setPaletteState] = useState<ThemePalette>(getInitialPalette)
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false)

  // Sincroniza classes no elemento raiz
  useEffect(() => {
    const root = document.documentElement

    // Modo Dark/Light
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(MODE_STORAGE_KEY, mode)

    // Paleta
    root.setAttribute('data-palette', palette)
    localStorage.setItem(PALETTE_STORAGE_KEY, palette)
  }, [mode, palette])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setPalette = useCallback((newPalette: ThemePalette) => {
    setPaletteState(newPalette)
  }, [])

  const openCommandPalette = useCallback(() => {
    setIsCommandOpen(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setIsCommandOpen(false)
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setIsCommandOpen((prev) => !prev)
  }, [])

  const value = useMemo(
    () => ({
      mode,
      palette,
      activeSection,
      isCommandOpen,
      setMode,
      toggleMode,
      setPalette,
      setActiveSection,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
    }),
    [
      mode,
      palette,
      activeSection,
      isCommandOpen,
      setMode,
      toggleMode,
      setPalette,
      setActiveSection,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
    ],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
