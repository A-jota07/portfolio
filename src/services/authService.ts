import type { AuthUser, LoginCredentials, LoginResponse } from '@/types/auth'
import { supabaseClient } from './supabaseClient'

const TOKEN_KEY = 'portfolio_auth_token'

const BASE_URL = import.meta.env.VITE_API_URL || ''
const API_BASE = `${BASE_URL}/api`

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
  // 1. Tenta autenticar no Backend Express (JWT)
  try {
    const data = await fetchWithAuth<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    setStoredToken(data.accessToken)
    return { success: true }
  } catch (backendErr) {
    // 2. Se o Supabase Auth estiver configurado diretamente, permite login via Supabase Auth como fallback
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        if (!error && data.session?.access_token) {
          setStoredToken(data.session.access_token)
          return { success: true }
        }
      } catch {
        // Segue para erro padrão
      }
    }

    return {
      success: false,
      error:
        backendErr instanceof Error ? backendErr.message : 'Credenciais inválidas.',
    }
  }
}

export function logout(): void {
  removeStoredToken()
  if (supabaseClient) {
    void supabaseClient.auth.signOut()
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken()
  if (!token) return null

  try {
    return await fetchWithAuth<AuthUser>('/auth/me')
  } catch {
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.auth.getUser()
        if (data.user?.email) {
          return {
            email: data.user.email,
            name:
              (data.user.user_metadata?.displayName as string | undefined) ||
              'Administrador',
            role: 'admin',
          }
        }
      } catch {
        // Ignora
      }
    }
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
