import type { Request, Response } from 'express'
import { z } from 'zod'

export const uploadResponseSchema = z.object({
  url: z.string().min(1),
  filename: z.string(),
  mimetype: z.string(),
  size: z.number(),
})

export const coverImageValidationSchema = z.string().min(1, 'Imagem de capa é obrigatória.').refine(
  (val) => {
    return (
      val.startsWith('/') ||
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('data:image/')
    )
  },
  { message: 'URL ou caminho de imagem inválido.' },
)

export function uploadImageController(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado.' })
    return
  }

  const imageUrl = `/uploads/${req.file.filename}`

  const responsePayload = {
    url: imageUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  }

  const parsed = uploadResponseSchema.safeParse(responsePayload)
  if (!parsed.success) {
    res.status(500).json({ error: 'Erro ao formatar resposta do upload.' })
    return
  }

  res.status(200).json(parsed.data)
}
