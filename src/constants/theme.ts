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
