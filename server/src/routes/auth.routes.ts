import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { loginHandler, meHandler } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { env } from '../config/env.js'

const loginLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
})

export const authRouter = Router()

authRouter.post('/login', loginLimiter, loginHandler)
authRouter.get('/me', authenticate, meHandler)
