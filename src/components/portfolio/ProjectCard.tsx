import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, FileCode2, Sparkles } from 'lucide-react'
import type { Project } from '@/types/project'
import { Card } from '@/components/ui/Card'
import { HoverZoomImage } from '@/components/ui/HoverZoomImage'
import { getTechIcon } from '@/components/admin/TagSelect'

interface ProjectCardProps {
  project: Project
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const prefersReducedMotion = Boolean(useReducedMotion())
  const containerRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    setTilt({
      rotateX: Number((-y * 6).toFixed(2)),
      rotateY: Number((x * 6).toFixed(2)),
    })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 })
  }

  return (
    <motion.div
      ref={containerRef}
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      style={
        !prefersReducedMotion
          ? {
              transformPerspective: 950,
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
            }
          : undefined
      }
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.3), ease: 'easeOut' }}
      className="h-full"
    >
      <Link to={`/portfolio/${project.slug}`} className="block h-full">
        <Card hoverZoom className="group flex h-full flex-col">
          {/* Barra estilo arquivo IDE */}
          <div className="flex items-center justify-between border-b border-surface-200/70 bg-surface-100/70 px-4 py-2 font-mono text-[11px] text-surface-500">
            <span className="inline-flex items-center gap-1.5 truncate">
              <FileCode2 className="h-3.5 w-3.5 shrink-0 text-accent-400" />
              <span className="truncate">{project.slug}.md</span>
            </span>
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded bg-accent-500/15 px-2 py-0.5 text-[10px] font-semibold text-accent-400">
                <Sparkles className="h-2.5 w-2.5" />
                <span>destaque</span>
              </span>
            )}
          </div>

          <motion.div layoutId={`project-cover-${project.slug}`}>
            <HoverZoomImage src={project.coverImage} alt={project.title} />
          </motion.div>

          <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
            <div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-100/90 px-2.5 py-1 font-mono text-[11px] font-medium text-surface-700 transition-colors group-hover:border-accent-400/30"
                  >
                    {getTechIcon(tag)}
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              <h3 className="font-display mb-2 text-xl font-bold tracking-tight text-surface-900 transition-colors duration-200 group-hover:text-accent-400">
                {project.title}
              </h3>

              <p className="line-clamp-2 text-sm leading-relaxed text-surface-500">
                {project.summary}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-surface-200/60 pt-3.5 font-mono text-xs text-surface-500">
              <span>ler case técnico</span>
              <span className="inline-flex items-center gap-1 font-semibold text-accent-400 transition-transform duration-200 group-hover:translate-x-0.5">
                <span>abrir</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
