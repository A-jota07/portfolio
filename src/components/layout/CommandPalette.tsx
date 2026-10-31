import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Code2,
  ExternalLink,
  FileCode2,
  FolderGit2,
  HelpCircle,
  Mail,
  Moon,
  Palette,
  Search,
  Sparkles,
  Sun,
  Terminal,
  User,
  X,
} from 'lucide-react'
import { PALETTE_OPTIONS, useTheme } from '@/context/ThemeContext'
import { useProjects } from '@/context/ProjectsContext'
import { PROFILE_DATA } from '@/data/profile'

interface CommandItem {
  id: string
  group: string
  label: string
  hint: string
  icon: React.ReactNode
  action: () => void
}

export function CommandPalette() {
  const navigate = useNavigate()
  const { projects } = useProjects()
  const {
    mode,
    palette,
    isCommandOpen,
    closeCommandPalette,
    toggleMode,
    setPalette,
  } = useTheme()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [terminalOutput, setTerminalOutput] = useState<string[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isCommandOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTerminalOutput(null)
      window.setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [isCommandOpen])

  const goToSection = (sectionId: string) => {
    closeCommandPalette()
    navigate('/')
    window.setTimeout(() => {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const commands = useMemo<CommandItem[]>(() => {
    const baseCommands: CommandItem[] = [
      {
        id: 'nav-inicio',
        group: '// navegacao',
        label: 'Ir para Início (_inicio.tsx)',
        hint: '~/portfolio/inicio',
        icon: <FileCode2 className="h-4 w-4 text-accent-400" />,
        action: () => {
          closeCommandPalette()
          navigate('/')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        },
      },
      {
        id: 'nav-sobre',
        group: '// navegacao',
        label: 'Ir para Sobre & Filosofia',
        hint: '#sobre',
        icon: <User className="h-4 w-4 text-accent-400" />,
        action: () => goToSection('sobre'),
      },
      {
        id: 'nav-skills',
        group: '// navegacao',
        label: 'Ir para Stack & Habilidades',
        hint: '#skills',
        icon: <Code2 className="h-4 w-4 text-accent-400" />,
        action: () => goToSection('skills'),
      },
      {
        id: 'nav-portfolio',
        group: '// navegacao',
        label: 'Abrir Catálogo de Projetos (_projetos.ts)',
        hint: '/portfolio',
        icon: <FolderGit2 className="h-4 w-4 text-accent-400" />,
        action: () => {
          closeCommandPalette()
          navigate('/portfolio')
        },
      },
      {
        id: 'nav-contato',
        group: '// navegacao',
        label: 'Entrar em Contato / Contratar (_contato.sh)',
        hint: '/contato',
        icon: <Mail className="h-4 w-4 text-accent-400" />,
        action: () => {
          closeCommandPalette()
          navigate('/contato')
        },
      },
      {
        id: 'theme-toggle-mode',
        group: '// aparencia_e_temas',
        label: mode === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro',
        hint: `atual: ${mode === 'dark' ? 'escuro' : 'claro'}`,
        icon:
          mode === 'dark' ? (
            <Sun className="h-4 w-4 text-accent-400" />
          ) : (
            <Moon className="h-4 w-4 text-accent-400" />
          ),
        action: () => {
          toggleMode()
          closeCommandPalette()
        },
      },
      ...PALETTE_OPTIONS.map((opt) => ({
        id: `palette-${opt.id}`,
        group: '// aparencia_e_temas',
        label: `Ativar paleta: ${opt.label}`,
        hint: palette === opt.id ? 'ativa' : opt.codeLabel,
        icon: <Palette className="h-4 w-4 text-accent-400" />,
        action: () => {
          setPalette(opt.id)
          closeCommandPalette()
        },
      })),
      ...projects.map((project) => ({
        id: `proj-${project.id}`,
        group: '// projetos_publicados',
        label: `Abrir projeto: ${project.title}`,
        hint: `/portfolio/${project.slug}`,
        icon: <Sparkles className="h-4 w-4 text-accent-400" />,
        action: () => {
          closeCommandPalette()
          navigate(`/portfolio/${project.slug}`)
        },
      })),
      {
        id: 'ext-github',
        group: '// links_externos',
        label: 'Abrir GitHub (@A-jota07)',
        hint: 'github.com',
        icon: <ExternalLink className="h-4 w-4 text-accent-400" />,
        action: () => {
          window.open(PROFILE_DATA.githubUrl, '_blank', 'noopener,noreferrer')
          closeCommandPalette()
        },
      },
      {
        id: 'ext-linkedin',
        group: '// links_externos',
        label: 'Abrir LinkedIn',
        hint: 'linkedin.com',
        icon: <ExternalLink className="h-4 w-4 text-accent-400" />,
        action: () => {
          window.open(PROFILE_DATA.linkedinUrl, '_blank', 'noopener,noreferrer')
          closeCommandPalette()
        },
      },
      {
        id: 'cmd-help',
        group: '// terminal_easter_egg',
        label: 'Executar comando: help (ou digite help, whoami, skills, contato)',
        hint: 'terminal interativo',
        icon: <HelpCircle className="h-4 w-4 text-accent-400" />,
        action: () => {
          setQuery('help')
        },
      },
    ]

    return baseCommands
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, palette, projects, navigate, closeCommandPalette, toggleMode, setPalette])

  // Easter egg do terminal quando o usuário digita comandos clássicos
  useEffect(() => {
    const trimmed = query.trim().toLowerCase()
    if (trimmed === 'help' || trimmed === '--help' || trimmed === '?') {
      setTerminalOutput([
        '$ alexandre-cli --help',
        'Comandos disponíveis no terminal interativo:',
        '  help      → Exibe este guia de comandos',
        '  whoami    → Resumo profissional e localização',
        '  skills    → Lista as principais tecnologias que domino',
        '  contato   → Exibe canais diretos para contratação',
        '  clear     → Limpa a saída do terminal',
      ])
    } else if (trimmed === 'whoami') {
      setTerminalOutput([
        '$ whoami',
        `${PROFILE_DATA.fullName}`,
        `${PROFILE_DATA.role} · ${PROFILE_DATA.location} (${PROFILE_DATA.availability})`,
        `${PROFILE_DATA.yearsOfExperience}+ anos de experiência prática construindo aplicações Full Stack.`,
      ])
    } else if (trimmed === 'skills' || trimmed === 'stack') {
      setTerminalOutput([
        '$ cat ~/portfolio/skills.json',
        'Front-end : React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vue.js',
        'Back-end  : Node.js, Express 5, Java, Spring Boot, JWT, Zod',
        'Database  : PostgreSQL, SQL, Docker, Git, Deploy Vercel & Render',
      ])
    } else if (trimmed === 'contato' || trimmed === 'hire') {
      setTerminalOutput([
        '$ ./contratar.sh',
        `E-mail   : ${PROFILE_DATA.email}`,
        `LinkedIn : ${PROFILE_DATA.linkedinUrl}`,
        `GitHub   : ${PROFILE_DATA.githubUrl}`,
        'Status   : Pronto para início imediato.',
      ])
    } else if (trimmed === 'clear') {
      setQuery('')
      setTerminalOutput(null)
    } else {
      setTerminalOutput(null)
    }
  }, [query])

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase().trim()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.group.toLowerCase().includes(q) ||
        cmd.hint.toLowerCase().includes(q),
    )
  }, [commands, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filteredCommands.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filteredCommands.length > 0) {
        setSelectedIndex(
          (prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length,
        )
      }
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault()
      filteredCommands[selectedIndex].action()
    }
  }

  return (
    <AnimatePresence>
      {isCommandOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-20 sm:pt-28"
          role="dialog"
          aria-modal="true"
          aria-label="Paleta de comandos do portfólio"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCommandPalette}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Janela de Comando estilo IDE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-elevated"
          >
            {/* Header da janela */}
            <div className="flex items-center justify-between border-b border-surface-200/80 bg-surface-100/70 px-4 py-2.5 font-mono text-xs text-surface-500">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-accent-400" />
                <span>~/portfolio — paleta_de_comandos</span>
              </div>
              <span className="text-[11px] text-surface-400">
                Digite <code className="text-accent-400">help</code> para modo terminal
              </span>
            </div>

            {/* Campo de busca */}
            <div className="flex items-center gap-3 border-b border-surface-200/80 px-4 py-3.5">
              <Search className="h-4 w-4 text-accent-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar seção, projeto, paleta ou comando (ex: help, whoami)..."
                className="w-full bg-transparent font-mono text-sm text-surface-900 placeholder-surface-400 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpar busca"
                  className="rounded-lg p-1 text-surface-400 hover:bg-surface-200 hover:text-surface-800 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={closeCommandPalette}
                className="rounded-md border border-surface-300 bg-surface-100 px-2 py-0.5 font-mono text-[10px] text-surface-500 hover:text-surface-900 cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Saída Easter Egg do Terminal */}
            {terminalOutput && (
              <div className="border-b border-surface-200/80 bg-surface-50/90 p-4 font-mono text-xs leading-relaxed text-surface-700">
                {terminalOutput.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      idx === 0
                        ? 'mb-1.5 font-bold text-accent-400'
                        : 'pl-2 text-surface-600'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}

            {/* Lista de comandos */}
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-10 text-center font-mono text-xs text-surface-500">
                  Nenhum comando encontrado para "{query}". Tente digitar{' '}
                  <button
                    type="button"
                    onClick={() => setQuery('help')}
                    className="text-accent-400 underline cursor-pointer"
                  >
                    help
                  </button>
                  .
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex
                    const showGroupHeader =
                      idx === 0 || filteredCommands[idx - 1].group !== cmd.group

                    return (
                      <div key={cmd.id}>
                        {showGroupHeader && (
                          <p className="px-3 pt-2.5 pb-1 font-mono text-[11px] font-semibold text-surface-400">
                            {cmd.group}
                          </p>
                        )}
                        <button
                          type="button"
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={cmd.action}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-accent-500/15 text-surface-900'
                              : 'text-surface-600 hover:bg-surface-100/80'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {cmd.icon}
                            <span className="truncate text-sm font-medium">
                              {cmd.label}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 font-mono text-xs text-surface-400">
                            <span>{cmd.hint}</span>
                            <ArrowRight
                              className={`h-3.5 w-3.5 transition-transform ${
                                isSelected
                                  ? 'translate-x-0.5 text-accent-400'
                                  : 'opacity-0'
                              }`}
                            />
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Rodapé de dicas */}
            <div className="flex items-center justify-between border-t border-surface-200/80 bg-surface-100/50 px-4 py-2 font-mono text-[11px] text-surface-400">
              <div className="flex items-center gap-3">
                <span>↑↓ navegar</span>
                <span>↵ executar</span>
                <span>esc fechar</span>
              </div>
              <span>alexandre-ide v2.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
