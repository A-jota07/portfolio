import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '@/context/ProjectsContext'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { Button } from '@/components/ui/Button'

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { getById, updateProject } = useProjects()
  const navigate = useNavigate()
  const project = id ? getById(id) : undefined

  if (!project) {
    return (
      <div className="text-center">
        <p className="text-surface-500">Projeto não encontrado.</p>
        <Link to="/admin" className="mt-4 inline-block">
          <Button variant="secondary">Voltar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Editar Projeto</h1>
          <p className="mt-1 text-sm text-surface-500">{project.title}</p>
        </div>
        <Link to={`/portfolio/${project.slug}`} target="_blank">
          <Button variant="secondary">Ver publicado</Button>
        </Link>
      </div>
      <ProjectForm
        initialData={{
          title: project.title,
          summary: project.summary,
          coverImage: project.coverImage,
          tags: project.tags,
          content: project.content,
          featured: project.featured,
        }}
        onSubmit={(data) => {
          updateProject(project.id, data)
          navigate('/admin')
        }}
        submitLabel="Salvar Alterações"
      />
    </div>
  )
}
