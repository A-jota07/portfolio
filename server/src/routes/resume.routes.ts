import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { requireAdmin } from '../middleware/requireAdmin.middleware.js'
import { handleResumeUpload } from '../middleware/resumeUpload.middleware.js'
import {
  getResumeController,
  resetResumeController,
  uploadResumeController,
} from '../controllers/resume.controller.js'

export const resumeRouter = Router()

// Consulta pública do currículo atual (usada pela Hero e visitantes)
resumeRouter.get('/', getResumeController)

// Upload ou configuração do currículo (protegido por token JWT de admin)
resumeRouter.post(
  '/',
  authenticate,
  requireAdmin,
  handleResumeUpload,
  uploadResumeController,
)

// Reset para o currículo padrão original (admin)
resumeRouter.delete('/', authenticate, requireAdmin, resetResumeController)
