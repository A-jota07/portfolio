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
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `img-${uniqueSuffix}${ext}`)
  },
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ]

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Tipo de arquivo não suportado. Envie apenas imagens (.jpg, .png, .webp, .gif, .svg).',
      ),
    )
  }
}

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('file')

export function handleSingleImageUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  uploader(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res
          .status(400)
          .json({ error: 'O arquivo excede o tamanho máximo permitido de 5MB.' })
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
      res.status(400).json({ error: 'Erro desconhecido ao processar o arquivo.' })
      return
    }

    next()
  })
}
