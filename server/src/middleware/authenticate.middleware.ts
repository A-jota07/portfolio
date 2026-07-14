import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../services/jwt.service.js'

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
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

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}
