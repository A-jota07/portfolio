import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { useProjects } from '@/context/ProjectsContext'

export function PortfolioPage() {
  const { projects } = useProjects()

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Trabalhos"
          title="Portfólio"
          subtitle="Explore os projetos que desenvolvi — cada um com case detalhado em Markdown."
        />
        {projects.length === 0 ? (
          <p className="text-center text-surface-500">Nenhum projeto publicado ainda.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
