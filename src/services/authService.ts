import type { AuthUser, LoginCredentials, LoginResponse } from '@/types/auth'
import { supabaseClient } from './supabaseClient'

const TOKEN_KEY = 'portfolio_auth_token'

const RAW_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const API_BASE = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL}/api`

function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

function setStoredToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
  // Remove resquícios antigos do localStorage caso existissem de versões anteriores
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('portfolio_auth_user')
}

function removeStoredToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('portfolio_auth_user')
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

        // Sincroniza em background com o backend na Render sem bloquear a navegação
        void fetchWithAuth<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(cleanCredentials),
        })
          .then((backendData) => {
            if (backendData?.accessToken) {
              setStoredToken(backendData.accessToken)
            }
          })
          .catch(() => {
            // Mantém o token do Supabase se a Render estiver em cold start
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
  // 1. Verifica sessão ativa validada criptograficamente pelo servidor do Supabase Auth
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.getUser()
      if (!error && data.user?.email) {
        const { data: sessionData } = await supabaseClient.auth.getSession()
        if (sessionData.session?.access_token) {
          setStoredToken(sessionData.session.access_token)
        }
        return {
          email: data.user.email,
          name:
            (data.user.user_metadata?.displayName as string | undefined) ||
            (data.user.user_metadata?.name as string | undefined) ||
            'Administrador',
          role: 'admin',
        }
      }
    } catch {
      // Continua para verificação via backend
    }
  }

  const token = getStoredToken()
  if (!token) return null

  // 2. Verifica assinatura JWT diretamente no Backend Express (/auth/me)
  try {
    const remoteUser = await fetchWithAuth<AuthUser>('/auth/me')
    if (remoteUser?.email && remoteUser.role === 'admin') {
      return {
        email: remoteUser.email,
        name: remoteUser.name || 'Administrador',
        role: 'admin',
      }
    }
    removeStoredToken()
    return null
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
