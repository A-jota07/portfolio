import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { requireAdmin } from '../middleware/requireAdmin.middleware.js'
import {
  handleSingleImageUpload,
  handleSingleResumeUpload,
} from '../middleware/upload.middleware.js'
import {
  getResumeConfigController,
  updateResumeConfigController,
  uploadImageController,
  uploadResumeController,
} from '../controllers/upload.controller.js'

export const uploadRouter = Router()

// Rate limiter específico para upload de arquivos (15 uploads por 10 minutos por IP)
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de upload excedido. Tente novamente mais tarde.' },
})

// Permite upload por usuários autenticados como admin
uploadRouter.post(
  '/',
  uploadLimiter,
  authenticate,
  requireAdmin,
  handleSingleImageUpload,
  uploadImageController,
)

// Rotas de gerenciamento e upload de currículo em PDF
uploadRouter.get('/resume', getResumeConfigController)

uploadRouter.put(
  '/resume',
  authenticate,
  requireAdmin,
  updateResumeConfigController,
)

uploadRouter.post(
  '/resume',
  uploadLimiter,
  authenticate,
  requireAdmin,
  handleSingleResumeUpload,
  uploadResumeController,
)

