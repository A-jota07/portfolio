import multer from 'multer'
import path from 'path'
import fs from 'fs'
import type { Request, Response, NextFunction } from 'express'

const uploadDir = path.resolve(process.cwd(), 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf'
    const cleanBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30)
    cb(null, `cv-${cleanBase}-${Date.now()}${ext}`)
  },
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  const ext = path.extname(file.originalname).toLowerCase()
  const isAllowedExt = ['.pdf', '.doc', '.docx'].includes(ext)

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase()) || isAllowedExt) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Tipo de arquivo inválido para currículo. Por favor, envie um documento em formato PDF ou DOCX.',
      ),
    )
  }
}

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
}).single('file')

export function handleResumeUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  uploader(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          error: 'O arquivo de currículo excede o tamanho máximo permitido de 10MB.',
        })
        return
      }
      res.status(400).json({ error: `Erro no upload: ${err.message}` })
      return
    }

    if (err instanceof Error) {
      res.status(400).json({ error: err.message })
      return
    }

    if (err) {
      res.status(400).json({ error: 'Erro desconhecido ao processar o currículo.' })
      return
    }

    next()
  })
}
