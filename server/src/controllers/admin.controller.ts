import type { Request, Response } from 'express'

export function adminDashboardHandler(_req: Request, res: Response): void {
  res.status(200).json({
    message: 'Área administrativa acessada com sucesso.',
    scope: 'admin',
  })
}

export function adminProjectsHandler(_req: Request, res: Response): void {
  res.status(200).json({
    message: 'Listagem de projetos (endpoint protegido).',
    data: [],
  })
}
