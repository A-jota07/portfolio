import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

export interface ProjectRecord {
  id: string
  slug: string
  title: string
  summary: string
  coverImage: string
  tags: string[]
  content: string
  featured: boolean
  repositoryUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectInputPayload {
  title: string
  summary: string
  coverImage: string
  tags: string[]
  content: string
  featured?: boolean
  repositoryUrl?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Configura cliente Supabase se as variáveis estiverem disponíveis no backend
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || ''
const supabaseKey =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  ''

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('sample-portfolio-id') &&
    !supabaseUrl.includes('your-supabase-project-id'),
)

export const supabaseServerClient: SupabaseClient | null = isServerSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null

// Armazenamento persistente em disco no servidor como fallback / espelho local
const DATA_DIR = path.resolve(process.cwd(), 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

const DEFAULT_SEED_PROJECTS: ProjectRecord[] = [
  {
    id: '1',
    slug: 'dashboard-analytics',
    title: 'Dashboard Analytics',
    summary: 'Painel interativo com gráficos em tempo real e filtros avançados.',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    tags: ['React', 'TypeScript', 'D3.js'],
    featured: true,
    repositoryUrl: 'https://github.com/A-jota07/portfolio',
    createdAt: '2025-11-01T10:00:00.000Z',
    updatedAt: '2025-11-01T10:00:00.000Z',
    content: `## Visão Geral\n\nDashboard de analytics construído com foco em **performance** e **acessibilidade**.\n\n### Destaques\n\n- Gráficos responsivos com D3.js\n- Filtros por período e categoria\n- Dark mode nativo`,
  },
  {
    id: '2',
    slug: 'ecommerce-minimal',
    title: 'E-commerce Minimal',
    summary: 'Loja virtual com checkout simplificado e experiência mobile-first.',
    coverImage:
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    tags: ['Next.js', 'Stripe', 'Tailwind'],
    featured: true,
    createdAt: '2025-10-15T10:00:00.000Z',
    updatedAt: '2025-10-15T10:00:00.000Z',
    content: `## Sobre o Projeto\n\nE-commerce com design minimalista e fluxo de compra em 3 passos.\n\n### Funcionalidades\n\n1. Catálogo com busca instantânea\n2. Carrinho persistente\n3. Pagamento via Stripe`,
  },
  {
    id: '3',
    slug: 'design-system',
    title: 'Design System',
    summary:
      'Biblioteca de componentes reutilizáveis com documentação Storybook.',
    coverImage:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    tags: ['React', 'Storybook', 'Figma'],
    featured: false,
    createdAt: '2025-09-20T10:00:00.000Z',
    updatedAt: '2025-09-20T10:00:00.000Z',
    content: `## Design System\n\nSistema de design com tokens semânticos e componentes acessíveis.`,
  },
]

function ensureLocalDataFile(): ProjectRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(
      PROJECTS_FILE,
      JSON.stringify(DEFAULT_SEED_PROJECTS, null, 2),
      'utf-8',
    )
    return DEFAULT_SEED_PROJECTS
  }
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as ProjectRecord[]
    return Array.isArray(parsed) ? parsed : DEFAULT_SEED_PROJECTS
  } catch {
    return DEFAULT_SEED_PROJECTS
  }
}

function writeLocalDataFile(projects: ProjectRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8')
}

// Normaliza registros vindos da tabela `projects` do Supabase (suportando tanto o schema antigo quanto o novo)
function normalizeFromSupabaseRow(row: Record<string, unknown>): ProjectRecord {
  const id = String(row.id ?? crypto.randomUUID())
  const title = String(row.title ?? 'Projeto sem título')
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
  const featured =
    typeof row.featured === 'boolean' ? row.featured : true

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

export async function listProjectsService(): Promise<ProjectRecord[]> {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        const normalized = data.map((row) =>
          normalizeFromSupabaseRow(row as Record<string, unknown>),
        )
        writeLocalDataFile(normalized)
        return normalized
      }
    } catch (err) {
      console.error('Erro ao listar projetos no Supabase:', err)
    }
  }

  const localProjects = ensureLocalDataFile()
  return localProjects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export async function getProjectBySlugService(
  slug: string,
): Promise<ProjectRecord | undefined> {
  const all = await listProjectsService()
  return all.find((p) => p.slug === slug)
}

export async function getProjectByIdService(
  id: string,
): Promise<ProjectRecord | undefined> {
  const all = await listProjectsService()
  return all.find((p) => p.id === id)
}

export async function createProjectService(
  input: ProjectInputPayload,
): Promise<ProjectRecord> {
  const now = new Date().toISOString()
  const newProject: ProjectRecord = {
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

  if (supabaseServerClient) {
    try {
      // Tenta inserir usando o formato compatível com o schema Supabase
      const dbPayload = {
        id: newProject.id,
        title: newProject.title,
        description: newProject.summary,
        category: newProject.tags[0] || 'Desenvolvimento Web',
        technologies: newProject.tags,
        architecture_details: newProject.content,
        github_url: newProject.repositoryUrl || null,
        cover_url: newProject.coverImage,
      }

      const { data, error } = await supabaseServerClient
        .from('projects')
        .insert([dbPayload])
        .select()

      if (!error && data && data[0]) {
        const saved = normalizeFromSupabaseRow(data[0] as Record<string, unknown>)
        saved.featured = newProject.featured
        const current = ensureLocalDataFile()
        writeLocalDataFile([saved, ...current.filter((p) => p.id !== saved.id)])
        return saved
      }
    } catch (err) {
      console.error('Erro ao criar projeto no Supabase, salvando localmente:', err)
    }
  }

  const projects = ensureLocalDataFile()
  projects.unshift(newProject)
  writeLocalDataFile(projects)
  return newProject
}

export async function updateProjectService(
  id: string,
  input: Partial<ProjectInputPayload>,
): Promise<ProjectRecord | null> {
  const projects = await listProjectsService()
  const existing = projects.find((p) => p.id === id)
  if (!existing) return null

  const updated: ProjectRecord = {
    ...existing,
    ...input,
    slug: input.title ? slugify(input.title) : existing.slug,
    repositoryUrl:
      input.repositoryUrl !== undefined
        ? input.repositoryUrl?.trim() || undefined
        : existing.repositoryUrl,
    updatedAt: new Date().toISOString(),
  }

  if (supabaseServerClient) {
    try {
      const dbPayload = {
        title: updated.title,
        description: updated.summary,
        category: updated.tags[0] || 'Desenvolvimento Web',
        technologies: updated.tags,
        architecture_details: updated.content,
        github_url: updated.repositoryUrl || null,
        cover_url: updated.coverImage,
      }

      const { data, error } = await supabaseServerClient
        .from('projects')
        .update(dbPayload)
        .eq('id', id)
        .select()

      if (!error && data && data[0]) {
        const saved = normalizeFromSupabaseRow(data[0] as Record<string, unknown>)
        saved.featured = updated.featured
        const localList = ensureLocalDataFile()
        const idx = localList.findIndex((p) => p.id === id)
        if (idx >= 0) localList[idx] = saved
        else localList.unshift(saved)
        writeLocalDataFile(localList)
        return saved
      }
    } catch (err) {
      console.error('Erro ao atualizar projeto no Supabase:', err)
    }
  }

  const localList = ensureLocalDataFile()
  const index = localList.findIndex((p) => p.id === id)
  if (index !== -1) {
    localList[index] = updated
  } else {
    localList.unshift(updated)
  }
  writeLocalDataFile(localList)
  return updated
}

export async function deleteProjectService(id: string): Promise<boolean> {
  if (supabaseServerClient) {
    try {
      const { error } = await supabaseServerClient
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao remover projeto no Supabase:', error.message)
      }
    } catch (err) {
      console.error('Exceção ao remover projeto no Supabase:', err)
    }
  }

  const projects = ensureLocalDataFile()
  const filtered = projects.filter((p) => p.id !== id)
  writeLocalDataFile(filtered)
  return true
}
