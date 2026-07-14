export type UserRole = 'admin' | 'user'

export interface JwtPayload {
  sub: string
  email: string
  name: string
  role: UserRole
  iat?: number
  exp?: number
  iss?: string
  aud?: string | string[]
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export {}
