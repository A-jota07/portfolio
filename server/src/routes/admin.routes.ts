import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { requireAdmin } from '../middleware/requireAdmin.middleware.js'
import {
  adminDashboardHandler,
  adminProjectsHandler,
} from '../controllers/admin.controller.js'
import { handleSingleImageUpload } from '../middleware/upload.middleware.js'
import { uploadImageController } from '../controllers/upload.controller.js'

export const adminRouter = Router()

adminRouter.use(authenticate, requireAdmin)

adminRouter.get('/dashboard', adminDashboardHandler)
adminRouter.get('/projects', adminProjectsHandler)
adminRouter.post('/upload', handleSingleImageUpload, uploadImageController)
