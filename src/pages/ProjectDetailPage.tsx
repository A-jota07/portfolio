import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  FileCode2,
  ListTree,
} from 'lucide-react'
import { useProjects } from '@/context/ProjectsContext'
import { MarkdownRenderer, slugifyHeading } from '@/components/portfolio/MarkdownRenderer'
import { Button } from '@/components/ui/Button'
import { getTechIcon } from '@/components/admin/TagSelect'
import { resolveImageUrl } from '@/services/uploadService'

interface TocItem {
  id: string
  text: string
  level: number
}

function extractTocFromMarkdown(markdown: string): TocItem[] {
  const lines = markdown.split('\n')
  const items: TocItem[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = /^(#{1,3})\s+(.+)$/.exec(line.trim())
    if (match) {
      const level = match[1].length
      const rawText = match[2].replace(/[*_`~]/g, '').trim()
      const id = slugifyHeading(rawText)
      if (id && rawText) {
        items.push({ id, text: rawText, level })
      }
    }
  }
  return items
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { projects, getBySlug } = useProjects()
  const prefersReducedMotion = Boolean(useReducedMotion())
  const project = slug ? getBySlug(slug) : undefined

  const { prevProject, nextProject } = useMemo(() => {
    if (!project || projects.length <= 1) {
      return { prevProject: undefined, nextProject: undefined }
    }
    const index = projects.findIndex((p) => p.id === project.id)
    if (index === -1) return { prevProject: undefined, nextProject: undefined }

    return {
      prevProject: index > 0 ? projects[index - 1] : undefined,
      nextProject: index < projects.length - 1 ? projects[index + 1] : undefined,
    }
  }, [project, projects])

  const tocItems = useMemo(
    () => (project ? extractTocFromMarkdown(project.content) : []),
    [project],
  )
  const readingMinutes = useMemo(
    () => (project ? estimateReadingTime(project.content) : 1),
    [project],
  )

  if (!project) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
        <p className="mb-2 font-mono text-xs text-accent-400">// erro_404</p>
        <h1 className="font-display mb-4 text-2xl font-bold text-surface-900">
          Projeto não encontrado
        </h1>
        <Link to="/portfolio">
          <Button variant="secondary">Voltar ao portfólio</Button>
        </Link>
      </section>
    )
  }

  return (
    <article className="px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Topo de navegação e metadados */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-100/80 px-3.5 py-2 font-mono text-xs font-medium text-surface-600 transition-colors hover:border-accent-400/50 hover:text-surface-900"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-accent-400" />
              <span>cd ../projetos</span>
            </Link>

            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-surface-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent-400" />
                <span>~{readingMinutes} min de leitura</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-accent-400" />
                <span>
                  {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </span>
            </div>
          </div>

          {/* Cabeçalho Editorial */}
          <div className="mb-8 max-w-4xl">
            <div className="mb-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-100 px-3 py-1 font-mono text-xs font-medium text-surface-700"
                >
                  {getTechIcon(tag)}
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            <h1 className="font-display text-fluid-h2 mb-4 font-bold tracking-tight text-surface-900 md:text-5xl">
              {project.title}
            </h1>
            <p className="text-base leading-relaxed text-surface-500 sm:text-lg">
              {project.summary}
            </p>
          </div>

          {/* Imagem de Capa com layoutId compartilhado */}
          <motion.div
            layoutId={`project-cover-${project.slug}`}
            className="bento-card mb-12 overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-surface-200/80 bg-surface-100/80 px-4 py-2 font-mono text-xs text-surface-500">
              <span className="inline-flex items-center gap-1.5">
                <FileCode2 className="h-3.5 w-3.5 text-accent-400" />
                <span>~/portfolio/projetos/{project.slug}.md</span>
              </span>
              <span>preview</span>
            </div>
            <img
              src={resolveImageUrl(project.coverImage)}
              alt={project.title}
              className="aspect-[21/9] w-full object-cover"
            />
          </motion.div>

          {/* Layout Editorial: Conteúdo Markdown + Índice Lateral (TOC) */}
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="bento-card rounded-3xl p-6 sm:p-10 lg:col-span-8">
              <MarkdownRenderer content={project.content} />
            </div>

            {/* Índice Lateral (Table of Contents) */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {tocItems.length > 0 && (
                  <div className="bento-card rounded-2xl p-5">
                    <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold text-accent-400">
                      <ListTree className="h-4 w-4" />
                      <span>// indice_do_documento</span>
                    </div>
                    <nav aria-label="Índice do artigo">
                      <ul className="space-y-2 font-mono text-xs">
                        {tocItems.map((item) => (
                          <li
                            key={item.id}
                            style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                          >
                            <a
                              href={`#${item.id}`}
                              className="block rounded-lg px-2 py-1 text-surface-600 transition-colors hover:bg-surface-100 hover:text-accent-400"
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                )}

                <div className="bento-card rounded-2xl p-5">
                  <p className="mb-2 font-mono text-xs font-semibold text-accent-400">
                    // gostou_deste_case?
                  </p>
                  <p className="mb-4 text-xs leading-relaxed text-surface-500">
                    Posso explicar as decisões de arquitetura e trade-offs técnicos deste projeto em uma conversa.
                  </p>
                  <Link to="/contato" className="block">
                    <Button variant="primary" className="w-full">
                      Conversar sobre este projeto
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Navegação Anterior / Próximo Projeto */}
          {(prevProject || nextProject) && (
            <div className="mt-12 grid gap-4 border-t border-surface-200/70 pt-8 sm:grid-cols-2">
              {prevProject ? (
                <Link
                  to={`/portfolio/${prevProject.slug}`}
                  className="bento-card group flex flex-col justify-between rounded-2xl p-5 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-surface-400 group-hover:text-accent-400">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>projeto_anterior</span>
                  </span>
                  <span className="font-display mt-2 text-base font-bold text-surface-900">
                    {prevProject.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextProject && (
                <Link
                  to={`/portfolio/${nextProject.slug}`}
                  className="bento-card group flex flex-col items-end justify-between rounded-2xl p-5 text-right transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-surface-400 group-hover:text-accent-400">
                    <span>proximo_projeto</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-display mt-2 text-base font-bold text-surface-900">
                    {nextProject.title}
                  </span>
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </article>
  )
}
