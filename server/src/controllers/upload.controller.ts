import type { Request, Response } from 'express'
import fs from 'fs'
import { z } from 'zod'
import { supabaseServerClient } from '../services/projects.service.js'

export const uploadResponseSchema = z.object({
  url: z.string().min(1),
  filename: z.string(),
  mimetype: z.string(),
  size: z.number(),
})

export const coverImageValidationSchema = z
  .string()
  .min(1, 'Imagem de capa é obrigatória.')
  .refine(
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

export async function uploadImageController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado.' })
    return
  }

  let imageUrl = `/uploads/${req.file.filename}`

  // Se o Supabase estiver configurado no servidor, tenta subir para o bucket 'portfolio'
  if (supabaseServerClient && req.file.path && fs.existsSync(req.file.path)) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path)
      const storagePath = `covers/${req.file.filename}`

      const { error: uploadErr } = await supabaseServerClient.storage
        .from('portfolio')
        .upload(storagePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true,
        })

      if (!uploadErr) {
        const { data: pubData } = supabaseServerClient.storage
          .from('portfolio')
          .getPublicUrl(storagePath)

        if (pubData?.publicUrl) {
          imageUrl = pubData.publicUrl
        }
      }
    } catch {
      // Mantém fallback local /uploads/:filename caso o bucket não exista
    }
  }

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
