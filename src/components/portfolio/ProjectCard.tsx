import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Project } from '@/types/project'
import { Card } from '@/components/ui/Card'
import { HoverZoomImage } from '@/components/ui/HoverZoomImage'

interface ProjectCardProps {
  project: Project
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/portfolio/${project.slug}`} className="block">
        <Card hoverZoom className="group">
          <HoverZoomImage src={project.coverImage} alt={project.title} />
          <div className="p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-surface-900 transition-colors group-hover:text-accent-600">
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
