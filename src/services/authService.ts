import type { AuthUser, LoginCredentials, LoginResponse } from '@/types/auth'
import { supabaseClient } from './supabaseClient'

const TOKEN_KEY = 'portfolio_auth_token'

const RAW_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const API_BASE = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL}/api`

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
  const cleanCredentials = {
    email: credentials.email.trim(),
    password: credentials.password,
  }

  // 1. Se o Supabase está conectado na Vercel, tenta autenticar via Supabase Auth primeiro
  //    (e sincroniza com o backend na Render se estiver acordado)
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: cleanCredentials.email,
        password: cleanCredentials.password,
      })
      if (!error && data.session?.access_token) {
        setStoredToken(data.session.access_token)
        // Tenta trocar por um JWT nativo do backend na Render em background se disponível
        try {
          const backendData = await fetchWithAuth<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(cleanCredentials),
          })
          if (backendData?.accessToken) {
            setStoredToken(backendData.accessToken)
          }
        } catch {
          // Mantém o access_token do Supabase (que o backend na Render também aceita!)
        }
        return { success: true }
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

    setStoredToken(data.accessToken)
    return { success: true }
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

  try {
    return await fetchWithAuth<AuthUser>('/auth/me')
  } catch {
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.auth.getUser()
        if (data.user?.email) {
          const userRole =
            (data.user.app_metadata?.role as string | undefined) ||
            (data.user.user_metadata?.role as string | undefined) ||
            'admin'

          if (userRole === 'admin') {
            return {
              email: data.user.email,
              name:
                (data.user.user_metadata?.displayName as string | undefined) ||
                'Administrador',
              role: 'admin',
            }
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
