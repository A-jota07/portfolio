import { Link } from 'react-router-dom'
import { useProjects } from '@/context/ProjectsContext'
import { ProjectList } from '@/components/admin/ProjectList'
import { Button } from '@/components/ui/Button'

export function DashboardPage() {
  const { projects, deleteProject } = useProjects()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Projetos</h1>
          <p className="mt-1 text-sm text-surface-500">
            Gerencie as postagens do seu portfólio.
          </p>
        </div>
        <Link to="/admin/novo">
          <Button>Novo Projeto</Button>
        </Link>
      </div>
      <ProjectList projects={projects} onDelete={deleteProject} />
    </div>
  )
}
