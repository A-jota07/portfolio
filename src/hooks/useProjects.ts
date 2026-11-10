import { createContext, useContext } from 'react'
import type { Project, ProjectInput } from '@/types/project'

export type SyncSource = 'supabase' | 'backend' | 'local'

export interface ProjectsContextValue {
  projects: Project[]
  isSyncing: boolean
  syncSource: SyncSource
  refresh: () => Promise<void>
  createProject: (input: ProjectInput) => Promise<Project>
  updateProject: (id: string, input: Partial<ProjectInput>) => Promise<Project | null>
  deleteProject: (id: string) => Promise<boolean>
  getBySlug: (slug: string) => Project | undefined
  getById: (id: string) => Project | undefined
}

export const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects deve ser usado dentro de ProjectsProvider')
  }
  return context
}
