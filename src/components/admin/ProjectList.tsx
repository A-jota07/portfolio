import { Link } from 'react-router-dom'
import type { Project } from '@/types/project'
import { Button } from '@/components/ui/Button'
import { getTechIcon } from './TagSelect'

interface ProjectListProps {
  projects: Project[]
  onDelete: (id: string) => void
}

export function ProjectList({ projects, onDelete }: ProjectListProps) {
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Deseja excluir o projeto "${title}"?`)) {
      onDelete(id)
    }
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-12 text-center">
        <p className="text-surface-500">Nenhum projeto cadastrado.</p>
        <Link to="/admin/novo" className="mt-4 inline-block">
          <Button>Criar primeiro projeto</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-surface-200 bg-surface-50">
          <tr>
            <th className="px-6 py-3 font-medium text-surface-600">Projeto</th>
            <th className="px-6 py-3 font-medium text-surface-600">Tags</th>
            <th className="px-6 py-3 font-medium text-surface-600">Atualizado</th>
            <th className="px-6 py-3 font-medium text-surface-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-surface-50/50">
              <td className="px-6 py-4">
                <p className="font-medium text-surface-800">{project.title}</p>
                <p className="mt-0.5 text-xs text-surface-400">/{project.slug}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-2.5 py-0.5 text-xs text-surface-600 border border-surface-200/50"
                    >
                      {getTechIcon(tag)}
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-surface-500">
                {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Link to={`/admin/editar/${project.id}`}>
                    <Button variant="secondary">Editar</Button>
                  </Link>
                  <Button variant="danger" onClick={() => handleDelete(project.id, project.title)}>
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
