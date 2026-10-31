import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, FolderGit2, Send } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { HeroSection } from '@/components/portfolio/HeroSection'
import { AboutSkillsSection } from '@/components/portfolio/AboutSkillsSection'
import { useProjects } from '@/context/ProjectsContext'
import { useTheme } from '@/context/ThemeContext'
import { PROFILE_DATA } from '@/data/profile'

export function HomePage() {
  const { projects } = useProjects()
  const { setActiveSection } = useTheme()
  const prefersReducedMotion = Boolean(useReducedMotion())
  const [selectedTag, setSelectedTag] = useState<string>('Todos')

  // Categorias dinâmicas derivadas das tags reais cadastradas nos projetos
  const projectTags = useMemo(() => {
    const tagSet = new Set<string>()
    projects.forEach((p) => {
      p.tags.forEach((t) => tagSet.add(t))
    })
    return ['Todos', ...Array.from(tagSet)]
  }, [projects])

  const displayedProjects = useMemo(() => {
    const base =
      selectedTag === 'Todos'
        ? projects
        : projects.filter((p) => p.tags.includes(selectedTag))

    const featuredFirst = [...base].sort(
      (a, b) => Number(b.featured) - Number(a.featured),
    )
    return featuredFirst.slice(0, 6)
  }, [projects, selectedTag])

  // IntersectionObserver para transicionar o matiz de cor conforme a seção visível
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section]')
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section')
            if (id) setActiveSection(id)
          }
        })
      },
      { threshold: 0.35 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [setActiveSection])

  return (
    <>
      <HeroSection publishedProjectsCount={projects.length} />

      <AboutSkillsSection />

      {/* SEÇÃO DE PROJETOS COM FILTRO DINÂMICO */}
      <section
        id="projetos"
        data-section="projetos"
        className="border-b border-surface-200/60 px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              codeComment="projetos_em_producao"
              title="Projetos & Cases Técnicos"
              subtitle="Aplicações desenvolvidas com arquitetura pensada para escala, documentação em Markdown e código limpo."
            />

            {projectTags.length > 1 && (
              <div
                role="tablist"
                aria-label="Filtrar projetos por tecnologia"
                className="mb-12 flex flex-wrap gap-2"
              >
                {projectTags.map((tag) => {
                  const active = selectedTag === tag
                  return (
                    <button
                      key={tag}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedTag(tag)}
                      className={`relative min-h-[38px] rounded-xl px-3.5 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'text-white'
                          : 'border border-surface-200 bg-surface-100/80 text-surface-600 hover:border-accent-400/40 hover:text-surface-900'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="home-project-filter"
                          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                          className="bg-accent-gradient absolute inset-0 -z-10 rounded-xl shadow-sm"
                        />
                      )}
                      <span>{tag}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {displayedProjects.length === 0 ? (
            <div className="bento-card rounded-2xl p-12 text-center font-mono text-sm text-surface-500">
              Nenhum projeto encontrado para o filtro "{selectedTag}".
            </div>
          ) : (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {displayedProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mt-12 flex justify-center"
          >
            <Link to="/portfolio">
              <Button variant="secondary">
                <FolderGit2 className="h-4 w-4 text-accent-400" />
                <span>Ver catálogo completo ({projects.length})</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* BANNER CTA FINAL PARA CONTRATAÇÃO */}
      <section data-section="contato" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="bento-card relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div
              className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{ background: 'var(--accent-glow)' }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-3">
                <p className="font-mono text-xs font-semibold text-accent-400">
                  // pronto_para_colaborar
                </p>
                <h2 className="font-display text-fluid-h2 font-bold tracking-tight text-surface-900">
                  Procurando um desenvolvedor com atenção aos detalhes?
                </h2>
                <p className="text-base leading-relaxed text-surface-600">
                  Estou disponível para oportunidades remotas como{' '}
                  <strong className="font-semibold text-surface-900">
                    {PROFILE_DATA.role}
                  </strong>{' '}
                  ou projetos sob demanda. Vamos conversar sobre como posso agregar ao seu time.
                </p>
              </div>

              <div className="flex flex-wrap gap-3.5">
                <Link to="/contato">
                  <Button variant="primary">
                    <Send className="h-4 w-4" />
                    <span>Iniciar Conversa</span>
                  </Button>
                </Link>
                <a
                  href={PROFILE_DATA.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">Conectar no LinkedIn</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
