import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { uploadRouter } from './routes/upload.routes.js'
import { projectsRouter } from './routes/projects.routes.js'
import { isServerSupabaseConfigured } from './services/projects.service.js'

const app = express()

app.disable('x-powered-by')

// Garante a existência do diretório de uploads
const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }),
)

app.use(express.json({ limit: '250kb' }))

// Servir arquivos de imagens estáticos em /uploads
app.use('/uploads', express.static(uploadDir))

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    supabaseConnected: isServerSupabaseConfigured,
  })
})

app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/upload', uploadRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

app.listen(env.PORT, () => {
  console.log(`🔐 API rodando em ${env.PORT}`)
  console.log(`   Ambiente: ${env.NODE_ENV}`)
  console.log(
    `   Banco de Dados: ${isServerSupabaseConfigured ? 'Supabase Conectado' : 'Storage Persistente Local'}`,
  )
})
