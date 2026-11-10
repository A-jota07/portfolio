import type { Project, ProjectInput } from '@/types/project'
import { getStoredAuthToken } from './authService'
import { supabaseClient } from './supabaseClient'

const STORAGE_KEY = 'portfolio_projects'
const BASE_URL = (import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')
const API_PROJECTS = `${BASE_URL}/api/projects`

const LEGACY_SEED_SLUGS = new Set([
  'dashboard-analytics',
  'ecommerce-minimal',
  'design-system',
])

function filterOutLegacySeeds(projects: Project[]): Project[] {
  return projects.filter(
    (p) =>
      !LEGACY_SEED_SLUGS.has(p.slug) &&
      !(p.id === '1' || p.id === '2' || p.id === '3'),
  )
}

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
    const parsed = JSON.parse(raw) as Project[]
    if (!Array.isArray(parsed)) return []
    const cleaned = filterOutLegacySeeds(parsed)
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    }
    return cleaned
  } catch {
    return []
  }
}

function writeProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filterOutLegacySeeds(projects)))
}

function normalizeSupabaseRow(row: Record<string, unknown>): Project {
  const id = String(row.id ?? crypto.randomUUID())
  const title = String(row.title ?? 'Projeto')
  const slug = String(row.slug ?? slugify(title))
  const summary = String(row.summary ?? row.description ?? '')
  const coverImage = String(
    row.cover_image ??
      row.coverImage ??
      row.cover_url ??
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  )
  const rawTags = row.tags ?? row.technologies ?? []
  const tags = Array.isArray(rawTags)
    ? rawTags.map((t) => String(t))
    : typeof rawTags === 'string'
      ? rawTags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

  const content = String(
    row.content ?? row.architecture_details ?? row.description ?? '',
  )
  const featured = typeof row.featured === 'boolean' ? row.featured : true

  const rawRepo =
    row.repository_url ?? row.repositoryUrl ?? row.github_url ?? row.githubUrl
  const repositoryUrl =
    typeof rawRepo === 'string' && rawRepo.trim().length > 0
      ? rawRepo.trim()
      : undefined

  const createdAt = String(row.created_at ?? row.createdAt ?? new Date().toISOString())
  const updatedAt = String(
    row.updated_at ?? row.updatedAt ?? row.created_at ?? new Date().toISOString(),
  )

  return {
    id,
    slug,
    title,
    summary,
    coverImage,
    tags,
    content,
    featured,
    repositoryUrl,
    createdAt,
    updatedAt,
  }
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

// Busca projetos sincronizados do Supabase (prioridade máxima) ou do backend (Render/Express)
export async function fetchRemoteProjects(): Promise<{
  projects: Project[] | null
  source: 'backend' | 'supabase' | 'local'
}> {
  // 1. PRIORIDADE: Se o cliente Supabase estiver configurado no front-end (Vercel),
  //    busca diretamente da tabela `projects` do Supabase onde seus posts reais estão salvos!
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        const normalized = filterOutLegacySeeds(
          data.map((r) => normalizeSupabaseRow(r as Record<string, unknown>)),
        )
        writeProjects(normalized)
        return { projects: normalized, source: 'supabase' }
      }
    } catch {
      // Continua para tentativa via Backend API
    }
  }

  // 2. Tenta buscar da API do Backend (/api/projects na Render)
  try {
    const response = await fetch(API_PROJECTS)
    if (response.ok) {
      const payload = (await response.json()) as {
        data?: Project[]
        source?: string
      }
      if (Array.isArray(payload.data)) {
        // Só aceita resposta do backend se vier do Supabase ou se não estivermos com Supabase configurado no front
        if (payload.source === 'supabase' || !supabaseClient) {
          const cleaned = filterOutLegacySeeds(payload.data)
          writeProjects(cleaned)
          return {
            projects: cleaned,
            source: payload.source === 'supabase' ? 'supabase' : 'backend',
          }
        }
      }
    }
  } catch {
    // Continua para o cache local
  }

  return { projects: null, source: 'local' }
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
    repositoryUrl: input.repositoryUrl?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
  const projects = readProjects()
  projects.unshift(project)
  writeProjects(projects)
  return project
}

export async function createProjectRemote(input: ProjectInput): Promise<Project> {
  // 1. Prioriza gravar diretamente no Supabase se configurado na Vercel
  if (supabaseClient) {
    try {
      const dbPayload = {
        title: input.title,
        description: input.summary,
        category: input.tags[0] || 'Desenvolvimento Web',
        technologies: input.tags,
        architecture_details: input.content,
        github_url: input.repositoryUrl?.trim() || null,
        cover_url: input.coverImage,
      }
      const { data, error } = await supabaseClient
        .from('projects')
        .insert([dbPayload])
        .select()

      if (!error && data && data[0]) {
        const saved = normalizeSupabaseRow(data[0] as Record<string, unknown>)
        saved.featured = input.featured ?? false
        const current = readProjects().filter((p) => p.id !== saved.id)
        writeProjects([saved, ...current])
        return saved
      }
    } catch {
      // Continua para tentativa via API do Backend
    }
  }

  const token = getStoredAuthToken()

  // 2. Envia para a API do Backend (que persiste no Supabase e no servidor)
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(API_PROJECTS, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    })

    if (response.ok) {
      const payload = (await response.json()) as { data?: Project }
      if (payload.data) {
        const current = readProjects().filter((p) => p.id !== payload.data!.id)
        writeProjects([payload.data, ...current])
        return payload.data
      }
    }
  } catch {
    // Fallback local
  }

  return createProject(input)
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
    repositoryUrl:
      input.repositoryUrl !== undefined
        ? input.repositoryUrl?.trim() || undefined
        : existing.repositoryUrl,
    updatedAt: new Date().toISOString(),
  }
  projects[index] = updated
  writeProjects(projects)
  return updated
}

export async function updateProjectRemote(
  id: string,
  input: Partial<ProjectInput>,
): Promise<Project | null> {
  const localUpdated = updateProject(id, input)
  const token = getStoredAuthToken()

  // 1. Atualiza via Backend API
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_PROJECTS}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(input),
    })

    if (response.ok) {
      const payload = (await response.json()) as { data?: Project }
      if (payload.data) {
        const projects = readProjects()
        const idx = projects.findIndex((p) => p.id === id)
        if (idx !== -1) projects[idx] = payload.data
        else projects.unshift(payload.data)
        writeProjects(projects)
        return payload.data
      }
    }
  } catch {
    // Fallback
  }

  // 2. Atualiza direto via Supabase SDK se disponível
  if (supabaseClient && localUpdated) {
    try {
      const dbPayload = {
        title: localUpdated.title,
        description: localUpdated.summary,
        category: localUpdated.tags[0] || 'Desenvolvimento Web',
        technologies: localUpdated.tags,
        architecture_details: localUpdated.content,
        github_url: localUpdated.repositoryUrl || null,
        cover_url: localUpdated.coverImage,
      }
      await supabaseClient.from('projects').update(dbPayload).eq('id', id)
    } catch {
      // Ignora erro silenciosamente e mantém atualização local
    }
  }

  return localUpdated
}

export function deleteProject(id: string): boolean {
  const projects = readProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false
  writeProjects(filtered)
  return true
}

export async function deleteProjectRemote(id: string): Promise<boolean> {
  const deletedLocal = deleteProject(id)
  const token = getStoredAuthToken()

  try {
    const headers: HeadersInit = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_PROJECTS}/${id}`, {
      method: 'DELETE',
      headers,
    })
    if (response.ok) return true
  } catch {
    // Fallback
  }

  if (supabaseClient) {
    try {
      await supabaseClient.from('projects').delete().eq('id', id)
      return true
    } catch {
      // Fallback
    }
  }

  return deletedLocal
}

export function seedProjectsIfEmpty(seed: Project[]): void {
  if (readProjects().length === 0) {
    writeProjects(seed)
  }
}
