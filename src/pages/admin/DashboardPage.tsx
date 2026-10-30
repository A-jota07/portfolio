import { Link } from 'react-router-dom'
import { Database, Plus, RefreshCw } from 'lucide-react'
import { useProjects } from '@/context/ProjectsContext'
import { ProjectList } from '@/components/admin/ProjectList'
import { Button } from '@/components/ui/Button'

export function DashboardPage() {
  const { projects, isSyncing, syncSource, refresh, deleteProject } = useProjects()

  const syncLabel =
    syncSource === 'supabase'
      ? '● SUPABASE + BACKEND SINCRONIZADO'
      : syncSource === 'backend'
        ? '● BACKEND API CONECTADO'
        : '● CACHE LOCAL (FALLBACK)'

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-accent-400">
              <Database className="h-3.5 w-3.5" />
              <span>// gerenciador_de_projetos</span>
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                syncSource === 'supabase' || syncSource === 'backend'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              }`}
            >
              {syncLabel}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-900">
            Projetos Publicados ({projects.length})
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Qualquer projeto criado ou editado aqui é sincronizado automaticamente com o backend e o site público.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            magnetic={false}
            onClick={() => void refresh()}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </Button>
          <Link to="/admin/novo">
            <Button>
              <Plus className="h-4 w-4" />
              <span>Novo Projeto</span>
            </Button>
          </Link>
        </div>
      </div>
      <ProjectList
        projects={projects}
        onDelete={(id) => {
          void deleteProject(id)
        }}
      />
    </div>
  )
}
