import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Project, ProjectInput } from '@/types/project'
import * as projectService from '@/services/projectService'
import { SEED_PROJECTS } from '@/data/seedProjects'

interface ProjectsContextValue {
  projects: Project[]
  refresh: () => void
  createProject: (input: ProjectInput) => Project
  updateProject: (id: string, input: Partial<ProjectInput>) => Project | null
  deleteProject: (id: string) => boolean
  getBySlug: (slug: string) => Project | undefined
  getById: (id: string) => Project | undefined
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])

  const refresh = useCallback(() => {
    projectService.seedProjectsIfEmpty(SEED_PROJECTS)
    setProjects(projectService.getAllProjects())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      projects,
      refresh,
      createProject: (input: ProjectInput) => {
        const created = projectService.createProject(input)
        refresh()
        return created
      },
      updateProject: (id: string, input: Partial<ProjectInput>) => {
        const updated = projectService.updateProject(id, input)
        refresh()
        return updated
      },
      deleteProject: (id: string) => {
        const deleted = projectService.deleteProject(id)
        if (deleted) refresh()
        return deleted
      },
      getBySlug: projectService.getProjectBySlug,
      getById: projectService.getProjectById,
    }),
    [projects, refresh],
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects deve ser usado dentro de ProjectsProvider')
  }
  return context
}
