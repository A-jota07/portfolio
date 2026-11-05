import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
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
    const rawExt = path.extname(file.originalname).toLowerCase()
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']
    const safeExt = allowedExts.includes(rawExt) ? rawExt : '.jpg'
    const uniqueId = crypto.randomUUID()
    cb(null, `img-${uniqueId}${safeExt}`)
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
    files: 1,
  },
}).single('file')

/**
 * Validação de Magic Bytes para imagens
 */
function validateImageMagicBytes(filePath: string, ext: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(16)
    fs.readSync(fd, buffer, 0, 16, 0)
    fs.closeSync(fd)

    // JPEG: FF D8 FF
    if (ext === '.jpg' || ext === '.jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (ext === '.png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      )
    }

    // GIF: GIF87a ou GIF89a
    if (ext === '.gif') {
      const header = buffer.subarray(0, 6).toString('ascii')
      return header === 'GIF87a' || header === 'GIF89a'
    }

    // WebP: RIFF....WEBP
    if (ext === '.webp') {
      const riff = buffer.subarray(0, 4).toString('ascii')
      const webp = buffer.subarray(8, 12).toString('ascii')
      return riff === 'RIFF' && webp === 'WEBP'
    }

    // SVG: Deve ser texto XML/SVG válido
    if (ext === '.svg') {
      const content = fs.readFileSync(filePath, 'utf-8').slice(0, 500).toLowerCase()
      // Não permitir scripts maliciosos em SVG (XSS em SVG)
      if (content.includes('<script') || content.includes('javascript:')) {
        return false
      }
      return content.includes('<svg') || content.includes('<?xml')
    }

    return true
  } catch {
    return false
  }
}

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

    // Validação de assinatura mágica
    if (req.file?.path) {
      const ext = path.extname(req.file.path).toLowerCase()
      const isValid = validateImageMagicBytes(req.file.path, ext)

      if (!isValid) {
        try {
          fs.unlinkSync(req.file.path)
        } catch {
          // Ignora
        }
        res.status(400).json({
          error:
            'Arquivo inválido ou corrompido. A assinatura da imagem não é autêntica ou contém scripts não permitidos.',
        })
        return
      }
    }

    next()
  })
}
