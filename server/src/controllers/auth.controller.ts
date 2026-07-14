import type { Request, Response } from 'express'
import { z } from 'zod'
import { authenticateAdmin } from '../services/auth.service.js'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
})

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: 'Dados de login inválidos.' })
    return
  }

  const result = await authenticateAdmin(parsed.data)

  if (!result) {
    // Mensagem genérica — não revela se o e-mail existe
    res.status(401).json({ error: 'Credenciais inválidas.' })
    return
  }

  res.status(200).json({
    accessToken: result.token,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
    user: result.user,
  })
}

export function meHandler(req: Request, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  res.status(200).json({
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
  })
}
