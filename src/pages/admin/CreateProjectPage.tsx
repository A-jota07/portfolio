import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { useToast } from '@/hooks/useToast'
import { ProjectForm } from '@/components/admin/ProjectForm'

export function CreateProjectPage() {
  const { createProject } = useProjects()
  const toast = useToast()
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
          try {
            const project = await createProject(data)
            toast.success('Projeto criado com sucesso!', project.title)
            navigate(`/admin/editar/${project.id}`)
          } catch {
            toast.error('Erro ao cadastrar projeto.')
          }
        }}
        submitLabel="Criar e Publicar Projeto"
      />
    </div>
  )
}
