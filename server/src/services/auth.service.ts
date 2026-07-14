import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { signAccessToken } from './jwt.service.js'

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

export async function authenticateAdmin(input: LoginInput): Promise<LoginResult | null> {
  const emailMatches = input.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()

  if (!emailMatches) {
    // Mitiga timing attacks: sempre executa bcrypt mesmo se e-mail não bater
    await bcrypt.compare(input.password, env.ADMIN_PASSWORD_HASH)
    return null
  }

  const passwordMatches = await bcrypt.compare(input.password, env.ADMIN_PASSWORD_HASH)
  if (!passwordMatches) return null

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
