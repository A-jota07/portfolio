export interface AuthUser {
  email: string
  name: string
  role: 'admin' | 'user'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokenPayload {
  sub: string
  email: string
  name: string
  role: 'admin' | 'user'
  exp: number
  iat: number
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: string
  user: AuthUser
}
