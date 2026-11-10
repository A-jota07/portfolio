import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../services/jwt.service.js'
import { supabaseServerClient } from '../services/projects.service.js'
import { env } from '../config/env.js'

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação ausente ou malformado.' })
    return
  }

  const token = authHeader.slice(7).trim()

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação ausente ou malformado.' })
    return
  }

  // 1. Tenta validar o JWT assinado pelo próprio backend Express
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
    return
  } catch {
    // 2. Fallback: Se o token veio direto do Supabase Auth no front-end, valida junto ao Supabase
    if (supabaseServerClient) {
      try {
        const { data, error } = await supabaseServerClient.auth.getUser(token)
        if (!error && data.user?.email) {
          req.user = {
            sub: data.user.id || data.user.email,
            email: data.user.email,
            name:
              (data.user.user_metadata?.displayName as string | undefined) ||
              env.ADMIN_NAME,
            role: 'admin',
          }
          next()
          return
        }
      } catch {
        // Ignora e retorna 401 abaixo
      }
    }

    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

