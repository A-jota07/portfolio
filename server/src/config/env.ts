import { config } from 'dotenv'
import fs from 'fs'
import { resolve } from 'path'
import { z } from 'zod'

if (process.env.NODE_ENV !== 'production') {
  const rootEnvPath = resolve(process.cwd(), '../.env')
  const localEnvPath = resolve(process.cwd(), '.env')
  if (fs.existsSync(rootEnvPath)) {
    config({ path: rootEnvPath })
  } else if (fs.existsSync(localEnvPath)) {
    config({ path: localEnvPath })
  }
}

const DEFAULT_DEV_JWT_SECRET =
  'dev_only_portfolio_jwt_secret_key_minimum_32_characters_2026'
// Hash bcrypt real para a senha padrão de desenvolvimento: "admin123"
const DEFAULT_DEV_PASSWORD_HASH =
  '$2b$12$b1EyIc5t9xpDDdtxza.oMO0pP8oLeK1TABhguNcN.NSbZGMOCzHpu'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres')
    .default(DEFAULT_DEV_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default('8h'),
  JWT_ISSUER: z.string().default('portfolio-api'),
  JWT_AUDIENCE: z.string().default('portfolio-admin'),
  ADMIN_EMAIL: z.string().email().default('alexandrecassiodesouzajunior@gmail.com'),
  ADMIN_NAME: z.string().min(1).default('Alexandre Junior'),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().default(DEFAULT_DEV_PASSWORD_HASH),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(15),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)

if (env.NODE_ENV === 'production') {
  if (env.JWT_SECRET === DEFAULT_DEV_JWT_SECRET) {
    console.warn(
      '⚠️ [Segurança] JWT_SECRET não definido no ambiente de produção. Configure uma chave forte na Render.',
    )
  }
  if (env.ADMIN_PASSWORD_HASH === DEFAULT_DEV_PASSWORD_HASH && !env.ADMIN_PASSWORD) {
    console.warn(
      '⚠️ [Segurança] ADMIN_PASSWORD_HASH padrão detectado em produção. Configure sua senha/hash na Render.',
    )
  }
}


