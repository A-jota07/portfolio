import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { requireAdmin } from '../middleware/requireAdmin.middleware.js'
import { handleResumeUpload } from '../middleware/resumeUpload.middleware.js'
import {
  downloadResumeController,
  getResumeController,
  resetResumeController,
  uploadResumeController,
  viewResumeController,
} from '../controllers/resume.controller.js'

export const resumeRouter = Router()

// Metadados públicos do currículo
resumeRouter.get('/', getResumeController)

// Visualização direta no navegador (com cabeçalhos MIME corretos)
resumeRouter.get('/view', viewResumeController)

// Download direto para recrutadores
resumeRouter.get('/download', downloadResumeController)

// Upload ou configuração de currículo (admin autenticado com JWT)
resumeRouter.post(
  '/',
  authenticate,
  requireAdmin,
  handleResumeUpload,
  uploadResumeController,
)

// Restauração para o currículo padrão (admin)
resumeRouter.delete('/', authenticate, requireAdmin, resetResumeController)
