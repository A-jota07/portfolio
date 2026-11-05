import fs from 'fs'
import path from 'path'
import { supabaseServerClient } from './projects.service.js'

export interface ResumeMetadata {
  url: string
  filename: string
  size?: number
  mimetype?: string
  updatedAt: string
  isCustom: boolean
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const RESUME_FILE = path.join(DATA_DIR, 'resume.json')

const DEFAULT_RESUME: ResumeMetadata = {
  url: '/curriculo.pdf',
  filename: 'Curriculo_Alexandre_Junior.pdf',
  size: 3840,
  mimetype: 'application/pdf',
  updatedAt: '2026-11-05T10:00:00.000Z',
  isCustom: false,
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getResumeService(): ResumeMetadata {
  ensureDataDir()
  if (!fs.existsSync(RESUME_FILE)) {
    return DEFAULT_RESUME
  }

  try {
    const raw = fs.readFileSync(RESUME_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as ResumeMetadata
    if (parsed && typeof parsed.url === 'string') {
      return parsed
    }
    return DEFAULT_RESUME
  } catch {
    return DEFAULT_RESUME
  }
}

export async function saveResumeFileService(file: {
  filename: string
  path: string
  mimetype: string
  size: number
  originalname: string
}): Promise<ResumeMetadata> {
  ensureDataDir()
  let finalUrl = `/uploads/${file.filename}`

  // Tenta upload no bucket Supabase caso configurado
  if (supabaseServerClient && file.path && fs.existsSync(file.path)) {
    try {
      const fileBuffer = fs.readFileSync(file.path)
      const storagePath = `resumes/${file.filename}`

      const { error: uploadErr } = await supabaseServerClient.storage
        .from('portfolio')
        .upload(storagePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        })

      if (!uploadErr) {
        const { data: pubData } = supabaseServerClient.storage
          .from('portfolio')
          .getPublicUrl(storagePath)

        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl
        }
      }
    } catch {
      // Fallback para URL estática local
    }
  }

  const metadata: ResumeMetadata = {
    url: finalUrl,
    filename: file.originalname || file.filename,
    size: file.size,
    mimetype: file.mimetype,
    updatedAt: new Date().toISOString(),
    isCustom: true,
  }

  fs.writeFileSync(RESUME_FILE, JSON.stringify(metadata, null, 2), 'utf-8')
  return metadata
}

export function saveResumeUrlService(
  url: string,
  filename?: string,
): ResumeMetadata {
  ensureDataDir()
  const metadata: ResumeMetadata = {
    url,
    filename: filename || 'Curriculo_Alexandre_Junior.pdf',
    updatedAt: new Date().toISOString(),
    isCustom: true,
  }

  fs.writeFileSync(RESUME_FILE, JSON.stringify(metadata, null, 2), 'utf-8')
  return metadata
}

export function resetResumeService(): ResumeMetadata {
  ensureDataDir()
  if (fs.existsSync(RESUME_FILE)) {
    try {
      fs.unlinkSync(RESUME_FILE)
    } catch {
      // Ignora erro de exclusão
    }
  }
  return DEFAULT_RESUME
}
