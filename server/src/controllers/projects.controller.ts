import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  createProjectService,
  deleteProjectService,
  getProjectByIdService,
  getProjectBySlugService,
  isServerSupabaseConfigured,
  listProjectsService,
  updateProjectService,
} from '../services/projects.service.js'

const projectInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Título é obrigatório.')
    .max(120, 'Título não pode exceder 120 caracteres.'),
  summary: z
    .string()
    .trim()
    .min(1, 'Resumo é obrigatório.')
    .max(350, 'Resumo não pode exceder 350 caracteres.'),
  coverImage: z
    .string()
    .trim()
    .min(1, 'Imagem de capa é obrigatória.')
    .max(2000, 'URL da imagem muito longa.')
    .refine(
      (val) =>
        val.startsWith('/') ||
        val.startsWith('https://') ||
        val.startsWith('http://') ||
        val.startsWith('data:image/'),
      { message: 'URL de imagem de capa inválida.' },
    ),
  tags: z
    .array(
      z
        .string()
        .trim()
        .max(35, 'Nome de tag muito longo.')
        .regex(/^[a-zA-Z0-9.\-_#+/\s]+$/, 'Tag contém caracteres inválidos.'),
    )
    .max(15, 'Máximo de 15 tags permitidas.')
    .default([]),
  content: z.string().max(80000, 'Conteúdo excede o limite máximo permitido.').default(''),
  featured: z.boolean().optional().default(false),
  repositoryUrl: z
    .string()
    .nullish()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined))
    .refine(
      (val) => {
        if (!val) return true
        try {
          const parsed = new URL(val)
          return parsed.protocol === 'https:' || parsed.protocol === 'http:'
        } catch {
          return false
        }
      },
      { message: 'URL do repositório deve ser um link HTTP ou HTTPS válido.' },
    ),
})

export async function listProjectsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const projects = await listProjectsService()
    res.status(200).json({
      data: projects,
      source: isServerSupabaseConfigured ? 'supabase' : 'backend-storage',
    })
  } catch (err) {
    console.error('Erro em listProjectsHandler:', err)
    res.status(500).json({ error: 'Erro ao listar projetos.' })
  }
}

export async function getProjectHandler(req: Request, res: Response): Promise<void> {
  const rawParam = req.params.idOrSlug
  const idOrSlug = Array.isArray(rawParam) ? rawParam[0] : rawParam
  if (!idOrSlug) {
    res.status(400).json({ error: 'Identificador inválido.' })
    return
  }

  const byId = await getProjectByIdService(idOrSlug)
  if (byId) {
    res.status(200).json({ data: byId })
    return
  }

  const bySlug = await getProjectBySlugService(idOrSlug)
  if (bySlug) {
    res.status(200).json({ data: bySlug })
    return
  }

  res.status(404).json({ error: 'Projeto não encontrado.' })
}

export async function createProjectHandler(req: Request, res: Response): Promise<void> {
  const parsed = projectInputSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? 'Dados do projeto inválidos.',
    })
    return
  }

  try {
    const created = await createProjectService(parsed.data)
    res.status(201).json({ data: created })
  } catch (err) {
    console.error('Erro em createProjectHandler:', err)
    res.status(500).json({ error: 'Erro ao criar projeto no servidor.' })
  }
}

export async function updateProjectHandler(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  if (!id) {
    res.status(400).json({ error: 'ID do projeto é obrigatório.' })
    return
  }

  const parsed = projectInputSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? 'Dados de atualização inválidos.',
    })
    return
  }

  try {
    const updated = await updateProjectService(id, parsed.data)
    if (!updated) {
      res.status(404).json({ error: 'Projeto não encontrado.' })
      return
    }
    res.status(200).json({ data: updated })
  } catch (err) {
    console.error('Erro em updateProjectHandler:', err)
    res.status(500).json({ error: 'Erro ao atualizar projeto no servidor.' })
  }
}

export async function deleteProjectHandler(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  if (!id) {
    res.status(400).json({ error: 'ID do projeto é obrigatório.' })
    return
  }

  try {
    const deleted = await deleteProjectService(id)
    res.status(200).json({ success: deleted })
  } catch (err) {
    console.error('Erro em deleteProjectHandler:', err)
    res.status(500).json({ error: 'Erro ao excluir projeto no servidor.' })
  }
}
