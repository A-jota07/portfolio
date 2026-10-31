import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  Cpu,
  GraduationCap,
  Layers,
  MapPin,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { getTechIcon } from '@/components/admin/TagSelect'
import { PROFILE_DATA, type SkillItem } from '@/data/profile'

function SkillProgressBar({
  skill,
  prefersReducedMotion,
}: {
  skill: SkillItem
  prefersReducedMotion: boolean
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(barRef, { once: true, margin: '-40px' })
  const [count, setCount] = useState(prefersReducedMotion ? skill.level : 0)

  useEffect(() => {
    if (!isInView) return
    if (prefersReducedMotion) {
      setCount(skill.level)
      return
    }

    let current = 0
    const step = Math.max(1, Math.ceil(skill.level / 28))
    const timer = window.setInterval(() => {
      current += step
      if (current >= skill.level) {
        setCount(skill.level)
        window.clearInterval(timer)
      } else {
        setCount(current)
      }
    }, 24)

    return () => window.clearInterval(timer)
  }, [isInView, skill.level, prefersReducedMotion])

  return (
    <motion.div
      layout
      ref={barRef}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bento-card flex flex-col justify-between rounded-2xl p-5"
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-surface-200 bg-surface-100">
              {getTechIcon(skill.tagKey)}
            </span>
            <h3 className="font-display text-sm font-bold text-surface-900 sm:text-base">
              {skill.name}
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-accent-400">
            {count}%
          </span>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-surface-500">
          {skill.description}
        </p>
      </div>

      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200/80">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: isInView ? `${skill.level}%` : 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
            }
            className="h-full rounded-full bg-accent-gradient"
          />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-surface-400">
          <span>{skill.category}</span>
          <span>proficiência</span>
        </div>
      </div>
    </motion.div>
  )
}

export function AboutSkillsSection() {
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')

  const categories = useMemo(() => {
    const unique = Array.from(new Set(PROFILE_DATA.skills.map((s) => s.category)))
    return ['Todas', ...unique]
  }, [])

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'Todas') return PROFILE_DATA.skills
    return PROFILE_DATA.skills.filter((s) => s.category === selectedCategory)
  }, [selectedCategory])

  return (
    <>
      {/* SEÇÃO 1: SOBRE & FILOSOFIA (BENTO GRID) */}
      <section
        id="sobre"
        data-section="sobre"
        className="border-b border-surface-200/60 px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            codeComment="sobre_e_filosofia"
            title="Engenharia de software com olhar de produto"
            subtitle="Arquitetura limpa no back-end e interfaces de alto impacto visual no front-end."
          />

          {/* Bento Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Card Principal Bio (2 colunas no desktop) */}
            <Card className="p-6 sm:p-8 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-accent-400">
                  <Terminal className="h-4 w-4" />
                  <span>cat ~/sobre_mim.md</span>
                </span>
                <span className="rounded-full border border-surface-200 bg-surface-100 px-3 py-0.5 font-mono text-[11px] text-surface-500">
                  {PROFILE_DATA.yearsOfExperience}+ anos de experiência
                </span>
              </div>

              <h3 className="font-display text-fluid-h3 mb-3 font-bold text-surface-900">
                De {PROFILE_DATA.location} para projetos de alto nível
              </h3>

              <p className="mb-4 text-sm leading-relaxed text-surface-600 sm:text-base">
                {PROFILE_DATA.bioShort}
              </p>
              <p className="text-sm leading-relaxed text-surface-500 sm:text-base">
                {PROFILE_DATA.bioExtended}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-surface-200/70 pt-5 font-mono text-xs text-surface-500">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-accent-400" />
                  <span>{PROFILE_DATA.location}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-accent-400" />
                  <span>Ciência da Computação</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5">
                  <Layers className="h-3.5 w-3.5 text-accent-400" />
                  <span>Full Stack (React · Node · Java)</span>
                </span>
              </div>
            </Card>

            {/* Card O que estou estudando agora */}
            <Card className="p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-2 font-mono text-xs text-accent-400">
                <BookOpen className="h-4 w-4" />
                <span>// estudando_agora</span>
              </div>

              <h3 className="font-display mb-4 text-lg font-bold text-surface-900">
                Evolução Contínua
              </h3>

              <div className="space-y-3.5">
                {PROFILE_DATA.studyingNow.map((item) => (
                  <div
                    key={item.topic}
                    className="rounded-xl border border-surface-200/80 bg-surface-100/50 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-xs font-bold text-surface-900 sm:text-sm">
                        {item.topic}
                      </p>
                      <span className="rounded bg-accent-500/15 px-2 py-0.5 font-mono text-[10px] text-accent-400">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-surface-500">
                      {item.focus}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 3 Cards de Pilares / Filosofia */}
            {PROFILE_DATA.philosophy.map((pillar) => (
              <Card key={pillar.code} className="p-6">
                <p className="mb-2 font-mono text-xs font-semibold text-accent-400">
                  {pillar.code}
                </p>
                <h3 className="font-display mb-2 text-lg font-bold text-surface-900">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-surface-500">
                  {pillar.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: SKILLS & PROFICIÊNCIA */}
      <section
        id="skills"
        data-section="skills"
        className="border-b border-surface-200/60 px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              codeComment="stack_e_ferramentas"
              title="Domínio Técnico & Ferramentas"
              subtitle="Filtre por área de atuação para inspecionar minha stack principal."
            />

            {/* Filtros por Categoria com Animação de Layout */}
            <div
              role="tablist"
              aria-label="Filtrar habilidades por categoria"
              className="mb-12 flex flex-wrap gap-2"
            >
              {categories.map((category) => {
                const active = selectedCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative min-h-[40px] rounded-xl px-3.5 py-2 font-mono text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'text-white'
                        : 'border border-surface-200 bg-surface-100/80 text-surface-600 hover:border-accent-400/40 hover:text-surface-900'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-skill-filter"
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                        className="bg-accent-gradient absolute inset-0 -z-10 rounded-xl shadow-sm"
                      />
                    )}
                    <span>{category}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredSkills.map((skill) => (
                <SkillProgressBar
                  key={skill.name}
                  skill={skill}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 3: TRAJETÓRIA & FORMAÇÃO */}
      <section
        id="trajetoria"
        data-section="trajetoria"
        className="border-b border-surface-200/60 px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            codeComment="git_log_trajetoria"
            title="Trajetória & Formação"
            subtitle="Experiência prática construindo sistemas completos e base acadêmica em Ciência da Computação."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {PROFILE_DATA.timeline.map((item, index) => (
              <Card key={item.role} className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/30 bg-accent-500/10 px-3 py-1 font-mono text-xs font-semibold text-accent-400">
                    {index === 0 ? (
                      <Briefcase className="h-3.5 w-3.5" />
                    ) : (
                      <Cpu className="h-3.5 w-3.5" />
                    )}
                    <span>{item.period}</span>
                  </span>
                  <span className="font-mono text-xs text-surface-400">
                    {item.location}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-surface-900 sm:text-xl">
                  {item.role}
                </h3>
                <p className="mt-1 font-mono text-xs font-medium text-accent-400">
                  {item.organization}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-surface-600">
                  {item.description}
                </p>

                <ul className="mt-4 space-y-2 border-t border-surface-200/70 pt-4">
                  {item.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-xs leading-relaxed text-surface-500 sm:text-sm"
                    >
                      <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-accent-400" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
