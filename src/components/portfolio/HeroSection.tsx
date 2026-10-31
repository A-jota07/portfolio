import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FolderGit2,
  MapPin,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PROFILE_DATA } from '@/data/profile'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/<>#$%'

function useScrambledText(targetText: string, disabled: boolean): string {
  const [display, setDisplay] = useState(targetText)

  useEffect(() => {
    if (disabled) {
      setDisplay(targetText)
      return
    }

    let iteration = 0
    const interval = window.setInterval(() => {
      setDisplay(
        targetText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration) return targetText[index]
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join(''),
      )

      iteration += 0.45
      if (iteration >= targetText.length) {
        setDisplay(targetText)
        window.clearInterval(interval)
      }
    }, 28)

    return () => window.clearInterval(interval)
  }, [targetText, disabled])

  return display
}

function useRotatingTypewriter(words: string[], disabled: boolean): string {
  const [wordIndex, setWordIndex] = useState(0)
  const [subText, setSubText] = useState(words[0] ?? '')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (disabled || words.length === 0) {
      setSubText(words[0] ?? '')
      return
    }

    const currentWord = words[wordIndex % words.length]
    const speed = isDeleting ? 32 : 62

    const timeout = window.setTimeout(() => {
      if (!isDeleting && subText === currentWord) {
        window.setTimeout(() => setIsDeleting(true), 1700)
        return
      }

      if (isDeleting && subText === '') {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % words.length)
        return
      }

      setSubText(
        isDeleting
          ? currentWord.slice(0, subText.length - 1)
          : currentWord.slice(0, subText.length + 1),
      )
    }, speed)

    return () => window.clearTimeout(timeout)
  }, [subText, isDeleting, wordIndex, words, disabled])

  return subText
}

const socialLinks = [
  {
    label: 'GitHub',
    href: PROFILE_DATA.githubUrl,
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: PROFILE_DATA.linkedinUrl,
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.065 2.065 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'E-mail',
    href: `mailto:${PROFILE_DATA.email}`,
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

interface HeroSectionProps {
  publishedProjectsCount: number
}

export function HeroSection({ publishedProjectsCount }: HeroSectionProps) {
  const prefersReducedMotion = Boolean(useReducedMotion())
  const scrambledName = useScrambledText(PROFILE_DATA.shortName, prefersReducedMotion)
  const rotatingRole = useRotatingTypewriter(
    PROFILE_DATA.rotatingRoles,
    prefersReducedMotion,
  )

  return (
    <section
      id="inicio"
      data-section="inicio"
      className="bg-gradient-hero relative overflow-hidden border-b border-surface-200/70 px-4 pt-12 pb-20 sm:px-6 md:pt-20 md:pb-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Coluna Esquerda: Apresentação, Cargo Dinâmico, CTAs e Métricas */}
          <motion.div
            variants={containerVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            className="space-y-6 lg:col-span-7"
          >
            {/* Badges de Status e Localização */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{PROFILE_DATA.availability}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-surface-100/80 px-3 py-1 font-mono text-xs text-surface-500">
                <MapPin className="h-3.5 w-3.5 text-accent-400" />
                <span>{PROFILE_DATA.location}</span>
              </span>
            </motion.div>

            {/* Comentário de código + Título com Decodificação + Cargo Typewriter */}
            <motion.div variants={itemVariants} className="space-y-3">
              <p className="font-mono text-xs font-medium text-accent-400">
                // olá_mundo, eu sou {PROFILE_DATA.fullName}
              </p>

              <h1 className="font-display text-fluid-hero font-bold tracking-tight text-surface-900">
                <span className="block">{scrambledName}</span>
                <span className="mt-1 flex min-h-[1.25em] items-center text-gradient text-2xl sm:text-3xl md:text-4xl">
                  <span className="mr-2 font-mono text-accent-400">&gt;</span>
                  <span>{rotatingRole}</span>
                  <span
                    className="ml-1 inline-block h-[1em] w-[3px] animate-pulse bg-accent-400"
                    aria-hidden="true"
                  />
                </span>
              </h1>
            </motion.div>

            {/* Bio */}
            <motion.p
              variants={itemVariants}
              className="max-w-xl text-base leading-relaxed text-surface-600 sm:text-lg"
            >
              {PROFILE_DATA.bioShort}
            </motion.p>

            {/* CTAs Principais */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link to="/contato">
                <Button variant="primary">
                  <span>Contratar / Conversar</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link to="/portfolio">
                <Button variant="secondary">
                  <FolderGit2 className="h-4 w-4 text-accent-400" />
                  <span>Explorar Projetos</span>
                </Button>
              </Link>
            </motion.div>

            {/* Links Sociais + Métricas Consistentes */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-3 pt-4 sm:max-w-lg"
            >
              <div className="bento-card rounded-2xl p-3.5">
                <p className="font-display text-2xl font-bold text-surface-900 sm:text-3xl">
                  {PROFILE_DATA.yearsOfExperience}+
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-surface-500">
                  anos de experiência
                </p>
              </div>

              <div className="bento-card rounded-2xl p-3.5">
                <p className="font-display text-2xl font-bold text-surface-900 sm:text-3xl">
                  {PROFILE_DATA.repositoriesCount}+
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-surface-500">
                  repositórios Git
                </p>
              </div>

              <div className="bento-card rounded-2xl p-3.5">
                <p className="font-display text-2xl font-bold text-surface-900 sm:text-3xl">
                  {publishedProjectsCount}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-surface-500">
                  cases publicados
                </p>
              </div>
            </motion.div>

            {/* Redes Sociais */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 pt-1">
              <span className="font-mono text-xs text-surface-400">// redes:</span>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-surface-200 bg-surface-100/80 px-3.5 py-2 font-mono text-xs font-medium text-surface-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-400/60 hover:text-surface-900"
                >
                  <span className="text-accent-400">{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Coluna Direita: Janela de IDE Interativa + Card de Perfil */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
          >
            {/* Brilho de fundo em malha */}
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl opacity-60 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, var(--accent-glow), transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="bento-card overflow-hidden rounded-3xl">
              {/* Barra superior da janela IDE */}
              <div className="flex items-center justify-between border-b border-surface-200/80 bg-surface-100/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-surface-500">
                  <Code2 className="h-3.5 w-3.5 text-accent-400" />
                  <span>engenheiro.config.ts</span>
                </div>
                <span className="rounded bg-accent-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-400">
                  TS 5.8
                </span>
              </div>

              {/* Corpo misto: Foto + Bloco de Código Tipado */}
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-4 rounded-2xl border border-surface-200/80 bg-surface-100/50 p-3.5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-accent-400/40 sm:h-20 sm:w-20">
                    <img
                      src="/fotoHome.png"
                      alt={`Foto de perfil de ${PROFILE_DATA.fullName}`}
                      width={80}
                      height={80}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="truncate font-display text-base font-bold text-surface-900 sm:text-lg">
                        {PROFILE_DATA.shortName}
                      </h2>
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-accent-400"
                        aria-label="Perfil verificado"
                      />
                    </div>
                    <p className="truncate font-mono text-xs text-accent-400">
                      @{PROFILE_DATA.handle}
                    </p>
                    <p className="mt-1 text-xs text-surface-500">
                      Ciência da Computação · Full Stack
                    </p>
                  </div>
                </div>

                {/* Bloco de código vivo */}
                <div className="rounded-2xl border border-surface-200/80 bg-surface-50/90 p-4 font-mono text-xs leading-relaxed">
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">01</span>
                    <span>
                      <span className="text-accent-400">const</span>{' '}
                      <span className="text-surface-900 font-semibold">engenheiro</span> = &#123;
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">02</span>
                    <span className="pl-4">
                      nome: <span className="text-emerald-400">'{PROFILE_DATA.shortName}'</span>,
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">03</span>
                    <span className="pl-4">
                      local: <span className="text-emerald-400">'{PROFILE_DATA.location}'</span>,
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">04</span>
                    <span className="pl-4">
                      experiencia:{' '}
                      <span className="text-amber-400">
                        '{PROFILE_DATA.yearsOfExperience}+ anos'
                      </span>
                      ,
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">05</span>
                    <span className="pl-4">
                      frontEnd:{' '}
                      <span className="text-accent-300">['React 19', 'TypeScript', 'Vue']</span>,
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">06</span>
                    <span className="pl-4">
                      backEnd:{' '}
                      <span className="text-accent-300">['Node.js', 'Python', 'PostgreSQL']</span>,
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">07</span>
                    <span className="pl-4">
                      remoto: <span className="text-accent-400 font-semibold">true</span>,
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="select-none text-surface-400">08</span>
                    <span>&#125; satisfies PerfilEngenheiro;</span>
                  </div>
                </div>

                {/* Rodapé do terminal */}
                <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-surface-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-accent-400" />
                    <span>build: passando (0 erros)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-accent-400">
                    <Sparkles className="h-3 w-3" />
                    <span>WCAG AA</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
