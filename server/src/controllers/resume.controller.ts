import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  getResumeService,
  resetResumeService,
  saveResumeFileService,
  saveResumeUrlService,
} from '../services/resume.service.js'

const urlResumeSchema = z.object({
  url: z.string().url('URL inválida.'),
  filename: z.string().optional(),
})

export function getResumeController(_req: Request, res: Response): void {
  const resume = getResumeService()
  res.status(200).json({
    message: 'Currículo recuperado com sucesso.',
    data: resume,
  })
}

export async function uploadResumeController(
  req: Request,
  res: Response,
): Promise<void> {
  // Caso 1: Upload via multipart/form-data
  if (req.file) {
    const resume = await saveResumeFileService(req.file)
    res.status(200).json({
      message: 'Currículo atualizado com sucesso.',
      data: resume,
    })
    return
  }

  // Caso 2: Payload JSON com URL externa
  const parsed = urlResumeSchema.safeParse(req.body)
  if (parsed.success) {
    const resume = saveResumeUrlService(
      parsed.data.url,
      parsed.data.filename,
    )
    res.status(200).json({
      message: 'Link do currículo atualizado com sucesso.',
      data: resume,
    })
    return
  }

  res.status(400).json({
    error:
      'Nenhum arquivo enviado e nenhuma URL válida fornecida no corpo da requisição.',
  })
}

export function resetResumeController(_req: Request, res: Response): void {
  const resume = resetResumeService()
  res.status(200).json({
    message: 'Currículo resetado para o padrão original.',
    data: resume,
  })
}
