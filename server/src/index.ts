import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { adminRouter } from './routes/admin.routes.js'

const app = express()

app.disable('x-powered-by')

app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
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

app.use(express.json({ limit: '10kb' }))

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

app.listen(env.PORT, () => {
  console.log(`🔐 API rodando em http://localhost:${env.PORT}`)
  console.log(`   Ambiente: ${env.NODE_ENV}`)
})
