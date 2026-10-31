import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { useProjects } from '@/context/ProjectsContext'

export function PortfolioPage() {
  const { projects } = useProjects()
  const [selectedTag, setSelectedTag] = useState<string>('Todos')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Deriva categorias dinamicamente das tags existentes nos projetos cadastrados
  const availableTags = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => {
      p.tags.forEach((t) => set.add(t))
    })
    return ['Todos', ...Array.from(set)]
  }, [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesTag =
        selectedTag === 'Todos' || project.tags.includes(selectedTag)
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.summary.toLowerCase().includes(q) ||
        project.tags.some((t) => t.toLowerCase().includes(q))

      return matchesTag && matchesSearch
    })
  }, [projects, selectedTag, searchQuery])

  return (
    <section className="px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          codeComment="diretorio_de_projetos"
          title="Portfólio & Estudos de Caso"
          subtitle="Explore os projetos que desenvolvi — cada um com documentação técnica detalhada em Markdown."
        />

        {/* Barra de ferramentas: Busca + Filtros Dinâmicos */}
        <div className="mb-10 flex flex-col justify-between gap-4 rounded-2xl border border-surface-200/80 bg-surface-100/50 p-4 lg:flex-row lg:items-center">
          {/* Busca por palavra-chave */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-accent-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="grep -i 'buscar por título ou stack'..."
              aria-label="Buscar projetos"
              className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 pr-9 pl-10 font-mono text-xs text-surface-900 placeholder-surface-400 outline-none transition-colors focus:border-accent-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-surface-400 hover:text-surface-800 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Chips de filtro derivados dinamicamente */}
          <div
            role="tablist"
            aria-label="Filtrar projetos por tecnologia"
            className="flex flex-wrap gap-1.5"
          >
            {availableTags.map((tag) => {
              const active = selectedTag === tag
              return (
                <button
                  key={tag}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedTag(tag)}
                  className={`relative min-h-[36px] rounded-xl px-3 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'text-white'
                      : 'border border-surface-200 bg-surface-50/80 text-surface-600 hover:border-accent-400/40 hover:text-surface-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="portfolio-page-filter"
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      className="bg-accent-gradient absolute inset-0 -z-10 rounded-xl shadow-sm"
                    />
                  )}
                  <span>{tag}</span>
                </button>
              )
            })}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bento-card rounded-2xl p-12 text-center">
            <p className="font-mono text-sm text-surface-500">
              Nenhum projeto encontrado para os critérios selecionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTag('Todos')
                setSearchQuery('')
              }}
              className="mt-4 font-mono text-xs font-semibold text-accent-400 underline underline-offset-4 cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  )
}
