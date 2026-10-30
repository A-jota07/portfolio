import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/context/ProjectsContext'
import { ProjectForm } from '@/components/admin/ProjectForm'

export function CreateProjectPage() {
  const { createProject } = useProjects()
  const navigate = useNavigate()

  return (
    <div>
      <p className="mb-1 font-mono text-xs text-accent-400">// novo_registro_remoto</p>
      <h1 className="font-display mb-2 text-2xl font-bold text-surface-900">
        Novo Projeto
      </h1>
      <p className="mb-8 text-sm text-surface-500">
        Ao salvar, o projeto é enviado automaticamente para o backend/Supabase e publicado no site em tempo real.
      </p>
      <ProjectForm
        onSubmit={async (data) => {
          const project = await createProject(data)
          navigate(`/admin/editar/${project.id}`)
        }}
        submitLabel="Criar e Publicar Projeto"
      />
    </div>
  )
}
