import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { requireAdmin } from '../middleware/requireAdmin.middleware.js'
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
} from '../controllers/projects.controller.js'

export const projectsRouter = Router()

// Rotas públicas para listagem e visualização automática no site
projectsRouter.get('/', listProjectsHandler)
projectsRouter.get('/:idOrSlug', getProjectHandler)

// Rotas protegidas (Admin JWT) para criação, atualização e exclusão
projectsRouter.post('/', authenticate, requireAdmin, createProjectHandler)
projectsRouter.put('/:id', authenticate, requireAdmin, updateProjectHandler)
projectsRouter.patch('/:id', authenticate, requireAdmin, updateProjectHandler)
projectsRouter.delete('/:id', authenticate, requireAdmin, deleteProjectHandler)
