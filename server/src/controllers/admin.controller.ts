import type { Request, Response } from 'express'
import {
  isServerSupabaseConfigured,
  listProjectsService,
} from '../services/projects.service.js'

export function adminDashboardHandler(_req: Request, res: Response): void {
  res.status(200).json({
    message: 'Área administrativa acessada com sucesso.',
    scope: 'admin',
    supabaseConnected: isServerSupabaseConfigured,
  })
}

export async function adminProjectsHandler(_req: Request, res: Response): Promise<void> {
  const projects = await listProjectsService()
  res.status(200).json({
    message: 'Listagem de projetos sincronizada.',
    data: projects,
    source: isServerSupabaseConfigured ? 'supabase' : 'backend-storage',
  })
}
