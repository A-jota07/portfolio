import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/context/ProjectsContext'
import { ProjectForm } from '@/components/admin/ProjectForm'

export function CreateProjectPage() {
  const { createProject } = useProjects()
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-surface-900">Novo Projeto</h1>
      <p className="mb-8 text-sm text-surface-500">
        Escreva o conteúdo em Markdown com suporte a código e imagens.
      </p>
      <ProjectForm
        onSubmit={(data) => {
          const project = createProject(data)
          navigate(`/admin/editar/${project.id}`)
        }}
        submitLabel="Criar Projeto"
      />
    </div>
  )
}
