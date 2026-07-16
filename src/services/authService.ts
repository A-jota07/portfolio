import type { AuthUser, LoginCredentials, LoginResponse } from '@/types/auth'

const TOKEN_KEY = 'portfolio_auth_token' 
const API_BASE = '/api'

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(error.error ?? 'Erro na requisição.')
  }

  return response.json() as Promise<T>
}

export async function login(
  credentials: LoginCredentials,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await fetchWithAuth<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    setStoredToken(data.accessToken)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Credenciais inválidas.',
    }
  }
}

export function logout(): void {
  removeStoredToken()
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken()
  if (!token) return null

  try {
    return await fetchWithAuth<AuthUser>('/auth/me')
  } catch {
    removeStoredToken()
    return null
  }
}

export function getStoredAuthToken(): string | null {
  return getStoredToken()
}

export async function verifyAdminAccess(): Promise<boolean> {
  const user = await fetchCurrentUser()
  return user?.role === 'admin'
}
