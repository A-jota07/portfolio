import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'dark' | 'light'
export type ThemePalette = 'neon' | 'cyan' | 'matrix' | 'amber' | 'magenta'

export interface PaletteOption {
  id: ThemePalette
  label: string
  codeLabel: string
  swatch: string
}

export const PALETTE_OPTIONS: PaletteOption[] = [
  {
    id: 'neon',
    label: 'Neon Roxo/Rosa',
    codeLabel: 'theme.neon_violet',
    swatch: 'oklch(0.68 0.24 295)',
  },
  {
    id: 'cyan',
    label: 'Ciano/Azul',
    codeLabel: 'theme.cyber_cyan',
    swatch: 'oklch(0.68 0.20 210)',
  },
  {
    id: 'matrix',
    label: 'Verde Matrix',
    codeLabel: 'theme.matrix_green',
    swatch: 'oklch(0.68 0.21 152)',
  },
  {
    id: 'amber',
    label: 'Âmbar/Laranja',
    codeLabel: 'theme.solar_amber',
    swatch: 'oklch(0.72 0.20 55)',
  },
  {
    id: 'magenta',
    label: 'Magenta/Violeta',
    codeLabel: 'theme.synth_magenta',
    swatch: 'oklch(0.68 0.24 332)',
  },
]

const MODE_STORAGE_KEY = 'portfolio_theme_mode'
const PALETTE_STORAGE_KEY = 'portfolio_theme_palette'

interface ThemeContextValue {
  mode: ThemeMode
  palette: ThemePalette
  activeSection: string
  isCommandOpen: boolean
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setPalette: (palette: ThemePalette) => void
  setActiveSection: (section: string) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(MODE_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

function getInitialPalette(): ThemePalette {
  if (typeof window === 'undefined') return 'neon'
  const stored = localStorage.getItem(PALETTE_STORAGE_KEY) as ThemePalette | null
  if (stored && PALETTE_OPTIONS.some((p) => p.id === stored)) {
    return stored
  }
  return 'neon'
}

const SECTION_HUE_SHIFTS: Record<string, number> = {
  inicio: 0,
  sobre: 14,
  skills: -12,
  projetos: 22,
  trajetoria: -18,
  contato: 10,
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode)
  const [palette, setPaletteState] = useState<ThemePalette>(getInitialPalette)
  const [activeSection, setActiveSectionState] = useState<string>('inicio')
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(mode)
    root.setAttribute('data-theme', mode)
    localStorage.setItem(MODE_STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-palette', palette)
    localStorage.setItem(PALETTE_STORAGE_KEY, palette)
  }, [palette])

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode)
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setPalette = useCallback((nextPalette: ThemePalette) => {
    setPaletteState(nextPalette)
  }, [])

  const setActiveSection = useCallback((section: string) => {
    setActiveSectionState(section)
    const shift = SECTION_HUE_SHIFTS[section] ?? 0
    document.documentElement.style.setProperty('--section-hue-shift', String(shift))
  }, [])

  const openCommandPalette = useCallback(() => setIsCommandOpen(true), [])
  const closeCommandPalette = useCallback(() => setIsCommandOpen(false), [])
  const toggleCommandPalette = useCallback(() => setIsCommandOpen((prev) => !prev), [])

  // Atalho global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandOpen((prev) => !prev)
      } else if (event.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandOpen])

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

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return ctx
}
