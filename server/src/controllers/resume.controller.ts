import type { Request, Response } from 'express'
import fs from 'fs'
import { z } from 'zod'
import {
  getResumeFilePathService,
  getResumeService,
  resetResumeService,
  saveResumeFileService,
  saveResumeUrlService,
} from '../services/resume.service.js'

const urlResumeSchema = z.object({
  url: z
    .string()
    .url('URL inválida.')
    .refine((val) => val.startsWith('https://') || val.startsWith('http://'), {
      message: 'Apenas URLs com protocolo HTTP ou HTTPS são permitidas.',
    }),
  filename: z.string().max(100).optional(),
})

export function getResumeController(_req: Request, res: Response): void {
  const resume = getResumeService()
  res.status(200).json({
    message: 'Currículo recuperado com sucesso.',
    data: resume,
  })
}

/**
 * Endpoint de visualização direta no navegador com os cabeçalhos apropriados
 * (elimina tela preta ao garantir Content-Type correto e Content-Disposition inline)
 */
export function viewResumeController(_req: Request, res: Response): void {
  const meta = getResumeService()

  // Se for uma URL externa (ex: Supabase ou nuvem)
  if (meta.url.startsWith('http://') || meta.url.startsWith('https://')) {
    res.redirect(meta.url)
    return
  }

  const { filePath, filename, mimetype } = getResumeFilePathService()

  if (filePath && fs.existsSync(filePath)) {
    res.setHeader('Content-Type', mimetype || 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Cache-Control', 'public, max-age=300')

    const stream = fs.createReadStream(filePath)
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao transmitir o documento.' })
      }
    })
    stream.pipe(res)
    return
  }

  res.status(404).json({ error: 'Arquivo de currículo não encontrado no servidor.' })
}

/**
 * Endpoint de download forçado com Content-Disposition: attachment
 */
export function downloadResumeController(_req: Request, res: Response): void {
  const meta = getResumeService()

  if (meta.url.startsWith('http://') || meta.url.startsWith('https://')) {
    res.redirect(meta.url)
    return
  }

  const { filePath, filename, mimetype } = getResumeFilePathService()

  if (filePath && fs.existsSync(filePath)) {
    res.setHeader('Content-Type', mimetype || 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
    return
  }

  res.status(404).json({ error: 'Arquivo de currículo não encontrado para download.' })
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
