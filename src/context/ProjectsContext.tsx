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
import { subscribeToProjectsRealtime } from '@/services/supabaseClient'
import { SEED_PROJECTS } from '@/data/seedProjects'

export type SyncSource = 'supabase' | 'backend' | 'local'

interface ProjectsContextValue {
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

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    projectService.seedProjectsIfEmpty(SEED_PROJECTS)
    return projectService.getAllProjects()
  })
  const [isSyncing, setIsSyncing] = useState<boolean>(true)
  const [syncSource, setSyncSource] = useState<SyncSource>('local')

  const refresh = useCallback(async () => {
    setIsSyncing(true)
    const remote = await projectService.fetchRemoteProjects()
    if (remote.projects) {
      setProjects(remote.projects)
      setSyncSource(remote.source)
    } else {
      projectService.seedProjectsIfEmpty(SEED_PROJECTS)
      setProjects(projectService.getAllProjects())
      setSyncSource('local')
    }
    setIsSyncing(false)
  }, [])

  useEffect(() => {
    void refresh()

    // Escuta alterações em tempo real vindas do Supabase (quando configurado)
    const unsubscribeRealtime = subscribeToProjectsRealtime(() => {
      void refresh()
    })

    // Sincroniza automaticamente quando a aba do navegador volta a ganhar foco
    const handleFocus = () => {
      void refresh()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      unsubscribeRealtime()
      window.removeEventListener('focus', handleFocus)
    }
  }, [refresh])

  const getBySlug = useCallback(
    (slug: string) => {
      return projects.find((p) => p.slug === slug) ?? projectService.getProjectBySlug(slug)
    },
    [projects],
  )

  const getById = useCallback(
    (id: string) => {
      return projects.find((p) => p.id === id) ?? projectService.getProjectById(id)
    },
    [projects],
  )

  const value = useMemo(
    () => ({
      projects,
      isSyncing,
      syncSource,
      refresh,
      createProject: async (input: ProjectInput) => {
        setIsSyncing(true)
        const created = await projectService.createProjectRemote(input)
        await refresh()
        return created
      },
      updateProject: async (id: string, input: Partial<ProjectInput>) => {
        setIsSyncing(true)
        const updated = await projectService.updateProjectRemote(id, input)
        await refresh()
        return updated
      },
      deleteProject: async (id: string) => {
        setIsSyncing(true)
        const deleted = await projectService.deleteProjectRemote(id)
        await refresh()
        return deleted
      },
      getBySlug,
      getById,
    }),
    [projects, isSyncing, syncSource, refresh, getBySlug, getById],
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
