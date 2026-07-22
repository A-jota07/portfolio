import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Project } from '@/types/project'
import { Card } from '@/components/ui/Card'
import { HoverZoomImage } from '@/components/ui/HoverZoomImage'
import { getTechIcon } from '@/components/admin/TagSelect'

interface ProjectCardProps {
  project: Project
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
    >
      <Link to={`/portfolio/${project.slug}`} className="block">
        <Card hoverZoom className="group">
          <HoverZoomImage src={project.coverImage} alt={project.title} />
          <div className="p-6">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-surface-100 px-3 py-1 text-xs font-semibold text-surface-800 transition-colors"
                >
                  {getTechIcon(tag)}
                  <span>{tag}</span>
                </span>
              ))}
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight text-surface-900 transition-colors duration-300 group-hover:text-surface-700">
              {project.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-surface-500">
              {project.summary}
            </p>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
