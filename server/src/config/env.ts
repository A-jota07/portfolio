import { config } from 'dotenv'
import { resolve } from 'path'
import { z } from 'zod'

if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '../.env') })
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  JWT_ISSUER: z.string().default('portfolio-api'),
  JWT_AUDIENCE: z.string().default('portfolio-admin'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_NAME: z.string().min(1),
  ADMIN_PASSWORD_HASH: z.string().startsWith('$2'),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(5),
})

export const env = envSchema.parse(process.env)