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
      <div className="bento-card rounded-2xl border-dashed p-12 text-center">
        <p className="font-mono text-sm text-surface-500">Nenhum projeto cadastrado.</p>
        <Link to="/admin/novo" className="mt-4 inline-block">
          <Button>Criar primeiro projeto</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bento-card overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="border-b border-surface-200 bg-surface-100/80 font-mono text-xs">
          <tr>
            <th className="px-6 py-3.5 font-medium text-surface-600">Projeto</th>
            <th className="px-6 py-3.5 font-medium text-surface-600">Stack</th>
            <th className="px-6 py-3.5 font-medium text-surface-600">Atualizado</th>
            <th className="px-6 py-3.5 font-medium text-surface-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200/60">
          {projects.map((project) => (
            <tr key={project.id} className="transition-colors hover:bg-surface-100/40">
              <td className="px-6 py-4">
                <p className="font-display font-bold text-surface-900">{project.title}</p>
                <p className="mt-0.5 font-mono text-xs text-surface-400">
                  /{project.slug}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-100 px-2.5 py-0.5 font-mono text-xs text-surface-700"
                    >
                      {getTechIcon(tag)}
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-xs text-surface-500">
                {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Link to={`/admin/editar/${project.id}`}>
                    <Button variant="secondary" magnetic={false}>
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    magnetic={false}
                    onClick={() => handleDelete(project.id, project.title)}
                  >
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
