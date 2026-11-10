import { createContext, useContext } from 'react'
import type { ThemeMode, ThemePalette } from '@/constants/theme'

export interface ThemeContextValue {
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

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return ctx
}
