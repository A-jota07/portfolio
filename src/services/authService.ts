import type { AuthUser, LoginCredentials, LoginResponse } from '@/types/auth'
import { supabaseClient } from './supabaseClient'

const TOKEN_KEY = 'portfolio_auth_token'
const USER_KEY = 'portfolio_auth_user'

const RAW_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const API_BASE = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL}/api`

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (parsed && parsed.email) {
      return {
        email: parsed.email,
        name: parsed.name || 'Administrador',
        role: 'admin',
      }
    }
    return null
  } catch {
    return null
  }
}

function setStoredUser(user: AuthUser): void {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      email: user.email,
      name: user.name || 'Administrador',
      role: 'admin',
    }),
  )
}

function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
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
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanCredentials = {
    email: credentials.email.trim(),
    password: credentials.password,
  }

  // 1. Se o Supabase está conectado na Vercel, autentica via Supabase Auth primeiro
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: cleanCredentials.email,
        password: cleanCredentials.password,
      })
      if (!error && data.session?.access_token && data.user?.email) {
        const supaUser: AuthUser = {
          email: data.user.email,
          name:
            (data.user.user_metadata?.displayName as string | undefined) ||
            (data.user.user_metadata?.name as string | undefined) ||
            'Administrador',
          role: 'admin',
        }
        setStoredToken(data.session.access_token)
        setStoredUser(supaUser)

        // Sincroniza em background com o backend na Render sem bloquear a navegação
        void fetchWithAuth<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(cleanCredentials),
        })
          .then((backendData) => {
            if (backendData?.accessToken) {
              setStoredToken(backendData.accessToken)
            }
            if (backendData?.user) {
              setStoredUser({ ...backendData.user, role: 'admin' })
            }
          })
          .catch(() => {
            // Mantém o token e usuário do Supabase se a Render estiver em cold start
          })

        return { success: true, user: supaUser }
      }
    } catch {
      // Se falhar no Supabase, tenta diretamente no Backend Express na Render abaixo
    }
  }

  // 2. Autentica no Backend Express na Render (JWT / ADMIN_EMAIL + ADMIN_PASSWORD_HASH)
  try {
    const data = await fetchWithAuth<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(cleanCredentials),
    })

    const authenticatedUser: AuthUser = {
      email: data.user?.email || cleanCredentials.email,
      name: data.user?.name || 'Administrador',
      role: 'admin',
    }
    setStoredToken(data.accessToken)
    setStoredUser(authenticatedUser)
    return { success: true, user: authenticatedUser }
  } catch (backendErr) {
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

  const cachedUser = getStoredUser()

  // 1. Verifica sessão ativa no Supabase Auth
  if (supabaseClient) {
    try {
      const { data } = await supabaseClient.auth.getUser()
      if (data.user?.email) {
        const supaUser: AuthUser = {
          email: data.user.email,
          name:
            (data.user.user_metadata?.displayName as string | undefined) ||
            (data.user.user_metadata?.name as string | undefined) ||
            cachedUser?.name ||
            'Administrador',
          role: 'admin',
        }
        setStoredUser(supaUser)
        return supaUser
      }
    } catch {
      // Continua para verificação via backend/cache
    }
  }

  // 2. Verifica no Backend Express (/auth/me)
  try {
    const remoteUser = await fetchWithAuth<AuthUser>('/auth/me')
    const normalized: AuthUser = {
      email: remoteUser.email,
      name: remoteUser.name || 'Administrador',
      role: 'admin',
    }
    setStoredUser(normalized)
    return normalized
  } catch {
    // Se já temos usuário autenticado em cache com token válido (ex.: Render hibernando), preserva a sessão
    if (cachedUser) {
      return cachedUser
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
