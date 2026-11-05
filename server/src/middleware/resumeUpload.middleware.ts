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
    const safeExt = ['.pdf', '.doc', '.docx'].includes(rawExt) ? rawExt : '.pdf'
    const uniqueId = crypto.randomUUID()
    cb(null, `cv-${uniqueId}${safeExt}`)
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
    files: 1,
  },
}).single('file')

/**
 * Validação rigorosa de Magic Bytes (assinatura binária) do arquivo
 * para impedir uploads de arquivos maliciosos renomeados.
 */
function validateResumeMagicBytes(filePath: string, ext: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(8)
    fs.readSync(fd, buffer, 0, 8, 0)
    fs.closeSync(fd)

    // PDF: %PDF- (0x25 0x50 0x44 0x46)
    if (ext === '.pdf') {
      return (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      )
    }

    // DOCX (formato zip OOXML): PK\x03\x04 (0x50 0x4b 0x03 0x04)
    if (ext === '.docx') {
      return (
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04
      )
    }

    // DOC legado OLE: 0xD0 0xCF 0x11 0xE0
    if (ext === '.doc') {
      return (
        buffer[0] === 0xd0 &&
        buffer[1] === 0xcf &&
        buffer[2] === 0x11 &&
        buffer[3] === 0xe0
      )
    }

    return false
  } catch {
    return false
  }
}

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

    // Se arquivo foi gravado, checar Magic Bytes
    if (req.file?.path) {
      const ext = path.extname(req.file.path).toLowerCase()
      const isValid = validateResumeMagicBytes(req.file.path, ext)

      if (!isValid) {
        // Remove arquivo falso/malicioso do disco imediatamente
        try {
          fs.unlinkSync(req.file.path)
        } catch {
          // Ignora
        }
        res.status(400).json({
          error:
            'Arquivo inválido ou corrompido. O conteúdo binário não corresponde a um documento PDF ou DOCX legítimo.',
        })
        return
      }
    }

    next()
  })
}
