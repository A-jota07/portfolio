import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GitBranch, Clock, Sparkles, Command, Sun, Moon } from 'lucide-react'
import { PALETTE_OPTIONS, useTheme } from '@/context/ThemeContext'
import { PROFILE_DATA } from '@/data/profile'

export function StatusBar() {
  const location = useLocation()
  const { mode, palette, toggleMode, setPalette, openCommandPalette } = useTheme()
  const [timeStr, setTimeStr] = useState<string>('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      )
    }
    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (location.pathname.startsWith('/admin')) return null

  const currentPaletteObj =
    PALETTE_OPTIONS.find((p) => p.id === palette) ?? PALETTE_OPTIONS[0]

  const cyclePalette = () => {
    const idx = PALETTE_OPTIONS.findIndex((p) => p.id === palette)
    const next = PALETTE_OPTIONS[(idx + 1) % PALETTE_OPTIONS.length]
    setPalette(next.id)
  }

  return (
    <div
      role="status"
      aria-label="Barra de status do ambiente"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-surface-200/80 bg-surface-50/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-2 px-3 font-mono text-[11px] text-surface-500 sm:px-6">
        {/* Esquerda: Branch main + Status Disponível */}
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="inline-flex items-center gap-1.5 rounded bg-accent-500/15 px-2 py-0.5 font-semibold text-accent-400">
            <GitBranch className="h-3 w-3" />
            <span>main*</span>
          </span>

          <span className="inline-flex items-center gap-1.5 truncate text-surface-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="truncate">{PROFILE_DATA.availability}</span>
          </span>
        </div>

        {/* Direita: Paleta ativa, modo, atalho e relógio */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={cyclePalette}
            title="Clique para alternar a paleta de cores"
            className="hidden items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-surface-200/60 hover:text-surface-900 sm:inline-flex cursor-pointer"
          >
            <Sparkles className="h-3 w-3 text-accent-400" />
            <span>{currentPaletteObj.codeLabel}</span>
          </button>

          <button
            type="button"
            onClick={toggleMode}
            title="Alternar entre modo escuro e claro"
            className="hidden items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-surface-200/60 hover:text-surface-900 md:inline-flex cursor-pointer"
          >
            {mode === 'dark' ? (
              <Moon className="h-3 w-3 text-accent-400" />
            ) : (
              <Sun className="h-3 w-3 text-accent-500" />
            )}
            <span>{mode === 'dark' ? 'escuro' : 'claro'}</span>
          </button>

          <button
            type="button"
            onClick={openCommandPalette}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-surface-200/60 hover:text-surface-900 cursor-pointer"
          >
            <Command className="h-3 w-3 text-accent-400" />
            <span className="hidden xs:inline">Ctrl+K</span>
          </button>

          <span className="hidden items-center gap-1 text-surface-400 lg:inline-flex">
            <span>UTF-8</span>
            <span>·</span>
            <span>TSX</span>
          </span>

          {timeStr && (
            <span className="inline-flex items-center gap-1 text-surface-600">
              <Clock className="h-3 w-3 text-accent-400" />
              <span>{timeStr}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
