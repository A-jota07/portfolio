import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { env } from '../config/env.js'
import { signAccessToken } from './jwt.service.js'
import { supabaseServerClient } from './projects.service.js'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  user: {
    email: string
    name: string
    role: 'admin'
  }
}

function safeCompareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

async function verifyConfiguredPassword(plainPassword: string): Promise<boolean> {
  // 1. Se ADMIN_PASSWORD em texto plano foi definido no ambiente
  if (env.ADMIN_PASSWORD && safeCompareStrings(plainPassword, env.ADMIN_PASSWORD)) {
    return true
  }

  const storedHash = env.ADMIN_PASSWORD_HASH.trim()

  // Evita aceitar a senha padrão de dev ("admin123") caso o servidor esteja em produção sem hash configurado
  if (
    env.NODE_ENV === 'production' &&
    storedHash === '$2b$12$b1EyIc5t9xpDDdtxza.oMO0pP8oLeK1TABhguNcN.NSbZGMOCzHpu' &&
    !env.ADMIN_PASSWORD
  ) {
    return false
  }

  // 2. Se ADMIN_PASSWORD_HASH for um hash bcrypt válido ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(plainPassword, storedHash)
  }

  // 3. Caso o usuário tenha colado a senha direta em ADMIN_PASSWORD_HASH na Render/Vercel
  return safeCompareStrings(plainPassword, storedHash)
}

export async function authenticateAdmin(input: LoginInput): Promise<LoginResult | null> {
  const normalizedInputEmail = input.email.trim().toLowerCase()
  const configuredEmail = env.ADMIN_EMAIL.trim().toLowerCase()
  const emailMatches =
    normalizedInputEmail === configuredEmail ||
    (env.NODE_ENV !== 'production' && normalizedInputEmail === 'admin@portfolio.dev')

  if (emailMatches) {
    const passwordMatches = await verifyConfiguredPassword(input.password)
    if (passwordMatches) {
      const token = signAccessToken({
        sub: env.ADMIN_EMAIL,
        email: env.ADMIN_EMAIL,
        name: env.ADMIN_NAME,
        role: 'admin',
      })

      return {
        token,
        user: {
          email: env.ADMIN_EMAIL,
          name: env.ADMIN_NAME,
          role: 'admin',
        },
      }
    }
  } else {
    // Mitiga timing attacks quando o e-mail não corresponde ao ADMIN_EMAIL local
    if (env.ADMIN_PASSWORD_HASH.startsWith('$2')) {
      await bcrypt.compare(input.password, env.ADMIN_PASSWORD_HASH)
    }
  }

  // Fallback: Se o Supabase estiver configurado no servidor, valida as credenciais no Supabase Auth
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient.auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      })

      if (!error && data.user?.email) {
        const displayName =
          (data.user.user_metadata?.displayName as string | undefined) ||
          (data.user.user_metadata?.name as string | undefined) ||
          env.ADMIN_NAME

        const token = signAccessToken({
          sub: data.user.id || data.user.email,
          email: data.user.email,
          name: displayName,
          role: 'admin',
        })

        return {
          token,
          user: {
            email: data.user.email,
            name: displayName,
            role: 'admin',
          },
        }
      }
    } catch {
      // Segue para retorno nulo caso o Supabase Auth falhe
    }
  }

  return null
}

