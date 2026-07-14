import type { Project, ProjectInput } from '@/types/project'

const STORAGE_KEY = 'portfolio_projects'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function readProjects(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

function writeProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function getAllProjects(): Project[] {
  return readProjects().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function getProjectBySlug(slug: string): Project | undefined {
  return readProjects().find((p) => p.slug === slug)
}

export function getProjectById(id: string): Project | undefined {
  return readProjects().find((p) => p.id === id)
}

export function createProject(input: ProjectInput): Project {
  const now = new Date().toISOString()
  const project: Project = {
    id: crypto.randomUUID(),
    slug: slugify(input.title),
    title: input.title,
    summary: input.summary,
    coverImage: input.coverImage,
    tags: input.tags,
    content: input.content,
    featured: input.featured ?? false,
    createdAt: now,
    updatedAt: now,
  }
  const projects = readProjects()
  projects.push(project)
  writeProjects(projects)
  return project
}

export function updateProject(id: string, input: Partial<ProjectInput>): Project | null {
  const projects = readProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null

  const existing = projects[index]
  const updated: Project = {
    ...existing,
    ...input,
    slug: input.title ? slugify(input.title) : existing.slug,
    updatedAt: new Date().toISOString(),
  }
  projects[index] = updated
  writeProjects(projects)
  return updated
}

export function deleteProject(id: string): boolean {
  const projects = readProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false
  writeProjects(filtered)
  return true
}

export function seedProjectsIfEmpty(seed: Project[]): void {
  if (readProjects().length === 0) {
    writeProjects(seed)
  }
}
