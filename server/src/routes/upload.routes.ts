import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { requireAdmin } from '../middleware/requireAdmin.middleware.js'
import { handleSingleImageUpload } from '../middleware/upload.middleware.js'
import { uploadImageController } from '../controllers/upload.controller.js'

export const uploadRouter = Router()

// Permite upload por usuários autenticados como admin
uploadRouter.post(
  '/',
  authenticate,
  requireAdmin,
  handleSingleImageUpload,
  uploadImageController,
)
