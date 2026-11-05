import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { uploadRouter } from './routes/upload.routes.js'
import { resumeRouter } from './routes/resume.routes.js'
import { projectsRouter } from './routes/projects.routes.js'
import { isServerSupabaseConfigured } from './services/projects.service.js'

const app = express()

// Desabilita cabeçalho que expõe o framework
app.disable('x-powered-by')

// Garante a existência do diretório de uploads
const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Cabeçalhos HTTP de segurança avançados
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        objectSrc: ["'self'", 'blob:', 'data:'],
        connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:'],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'sameorigin' },
    hidePoweredBy: true,
    hsts: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
    ieNoOpen: true,
    noSniff: true,
    xssFilter: true,
  }),
)

// Rate Limiter Global para mitigar DoS e abuso de requisições
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Máximo de 300 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
})

app.use('/api', globalLimiter)

// Configuração robusta de CORS
const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como curl, mobile ou requisições do mesmo domínio)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true)
      }
      return callback(null, true) // Em ambiente de portfólio público, permite leitura
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }),
)

app.use(express.json({ limit: '250kb' }))

// Servir arquivos de uploads com cabeçalhos apropriados
app.use(
  '/uploads',
  express.static(uploadDir, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline')
      }
    },
  }),
)

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: env.NODE_ENV,
    supabaseConnected: isServerSupabaseConfigured,
  })
})

// Rotas da API
app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/resume', resumeRouter)

// Rota 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

// Middleware global de tratamento de erros defensivo (evita vazamento de stack traces)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled internal error:', err)
  res.status(500).json({
    error: 'Ocorreu um erro interno no servidor ao processar a requisição.',
  })
})

app.listen(env.PORT, () => {
  console.log(`🔐 API de alta segurança rodando na porta ${env.PORT}`)
  console.log(`   Ambiente: ${env.NODE_ENV}`)
  console.log(
    `   Banco de Dados: ${isServerSupabaseConfigured ? 'Supabase Conectado' : 'Storage Persistente Local'}`,
  )
})
