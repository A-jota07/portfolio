import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProjects } from '@/context/ProjectsContext'
import { MarkdownRenderer } from '@/components/portfolio/MarkdownRenderer'
import { Button } from '@/components/ui/Button'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { getBySlug } = useProjects()
  const project = slug ? getBySlug(slug) : undefined

  if (!project) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20">
        <h1 className="mb-4 text-2xl font-semibold text-surface-800">Projeto não encontrado</h1>
        <Link to="/portfolio">
          <Button variant="secondary">Voltar ao portfólio</Button>
        </Link>
      </section>
    )
  }

  return (
    <article className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/portfolio"
            className="mb-8 inline-flex items-center gap-2 text-sm text-surface-500 transition-colors hover:text-surface-800"
          >
            ← Voltar ao portfólio
          </Link>

          <div className="mb-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-surface-900 md:text-5xl">
            {project.title}
          </h1>
          <p className="mb-8 text-lg text-surface-500">{project.summary}</p>

          <div className="group mb-12 overflow-hidden rounded-2xl shadow-elevated">
            <motion.img
              src={project.coverImage}
              alt={project.title}
              className="aspect-[21/9] w-full object-cover"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          <div className="rounded-2xl border border-surface-200/80 bg-white/70 p-8 shadow-soft md:p-12">
            <MarkdownRenderer content={project.content} />
          </div>
        </motion.div>
      </div>
    </article>
  )
}
