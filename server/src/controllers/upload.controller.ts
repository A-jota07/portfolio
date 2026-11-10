import type { Request, Response } from 'express'
import fs from 'fs'
import { z } from 'zod'
import { supabaseServerClient } from '../services/projects.service.js'
import {
  getResumeConfigService,
  updateResumeConfigService,
} from '../services/resume.service.js'

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
      const trimmed = val.trim().toLowerCase()
      if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:text/')) {
        return false
      }
      return (
        trimmed.startsWith('/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:image/')
      )
    },
    { message: 'URL ou caminho de imagem inválido. Use um caminho relativo ou URL HTTP/HTTPS.' },
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
          // Remove arquivo temporário do disco local para evitar arquivos órfãos
          try {
            await fs.promises.unlink(req.file.path)
          } catch {
            // Ignora erro de remoção não-crítico
          }
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

const resumeUpdateSchema = z.object({
  url: z.string().optional(),
  filename: z.string().optional(),
  enabled: z.boolean().optional(),
})

export async function getResumeConfigController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const config = await getResumeConfigService()
    res.status(200).json(config)
  } catch {
    res.status(500).json({ error: 'Erro ao carregar configuração do currículo.' })
  }
}

export async function updateResumeConfigController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = resumeUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos para configuração do currículo.' })
    return
  }

  try {
    const updated = await updateResumeConfigService(parsed.data)
    res.status(200).json(updated)
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar configuração do currículo.' })
  }
}

export async function uploadResumeController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo PDF foi enviado.' })
    return
  }

  let pdfUrl = `/uploads/${req.file.filename}`

  if (supabaseServerClient && req.file.path && fs.existsSync(req.file.path)) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path)
      const storagePath = `resumes/${req.file.filename}`

      const { error: uploadErr } = await supabaseServerClient.storage
        .from('portfolio')
        .upload(storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (!uploadErr) {
        const { data: pubData } = supabaseServerClient.storage
          .from('portfolio')
          .getPublicUrl(storagePath)

        if (pubData?.publicUrl) {
          pdfUrl = pubData.publicUrl
          try {
            await fs.promises.unlink(req.file.path)
          } catch {
            // Ignora erro de remoção não-crítico
          }
        }
      }
    } catch {
      // Mantém fallback local /uploads/:filename
    }
  }

  const displayFilename = req.file.originalname || req.file.filename
  const config = await updateResumeConfigService({
    url: pdfUrl,
    filename: displayFilename,
    enabled: true,
  })

  res.status(200).json({
    url: pdfUrl,
    filename: displayFilename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    config,
  })
}

