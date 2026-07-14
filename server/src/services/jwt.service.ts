import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { JwtPayload, UserRole } from '../types/auth.types.js'

export function signAccessToken(params: {
  sub: string
  email: string
  name: string
  role: UserRole
}): string {
  return jwt.sign(
    {
      sub: params.sub,
      email: params.email,
      name: params.name,
      role: params.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithm: 'HS256',
    },
  )
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ['HS256'],
  }) as JwtPayload

  return payload
}
