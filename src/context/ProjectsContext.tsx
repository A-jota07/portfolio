import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Project, ProjectInput } from '@/types/project'
import * as projectService from '@/services/projectService'
import { SEED_PROJECTS } from '@/data/seedProjects'
import { ProjectsContext, type SyncSource } from '@/hooks/useProjects'

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    projectService.seedProjectsIfEmpty(SEED_PROJECTS)
    return projectService.getAllProjects()
  })
  const [isSyncing, setIsSyncing] = useState<boolean>(true)
  const [syncSource, setSyncSource] = useState<SyncSource>('local')
  const lastFocusSyncRef = useRef<number>(Date.now())

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

    // Sincroniza automaticamente quando a aba do navegador volta a ganhar foco (throttle de 60s)
    const handleFocus = () => {
      if (Date.now() - lastFocusSyncRef.current > 60_000) {
        lastFocusSyncRef.current = Date.now()
        void refresh()
      }
    }
    window.addEventListener('focus', handleFocus)

    return () => {
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
