import multer from 'multer'
import path from 'path'
import fs from 'fs'
import type { Request, Response, NextFunction } from 'express'

const uploadDir = path.resolve(process.cwd(), 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    // Define a extensão estritamente a partir do MIME type verificado para prevenir upload de extensões arbitrárias
    const ext = MIME_TO_EXT[file.mimetype.toLowerCase()] || '.jpg'
    cb(null, `img-${uniqueSuffix}${ext}`)
  },
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const mime = file.mimetype.toLowerCase()
  if (Object.prototype.hasOwnProperty.call(MIME_TO_EXT, mime)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Tipo de arquivo não suportado. Envie apenas imagens raster seguras (.jpg, .png, .webp, .gif, .avif).',
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
