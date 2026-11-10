import fs from 'fs'
import path from 'path'
import { supabaseServerClient } from './projects.service.js'

export interface ResumeConfig {
  url: string
  filename: string
  enabled: boolean
  updatedAt: string
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const RESUME_DATA_FILE = path.join(DATA_DIR, 'resume.json')

const DEFAULT_RESUME_CONFIG: ResumeConfig = {
  url: '',
  filename: '',
  enabled: false,
  updatedAt: new Date().toISOString(),
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function readLocalResumeConfig(): ResumeConfig {
  ensureDataDir()
  if (!fs.existsSync(RESUME_DATA_FILE)) {
    fs.writeFileSync(RESUME_DATA_FILE, JSON.stringify(DEFAULT_RESUME_CONFIG, null, 2), 'utf-8')
    return { ...DEFAULT_RESUME_CONFIG }
  }

  try {
    const raw = fs.readFileSync(RESUME_DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<ResumeConfig>
    return {
      url: typeof parsed.url === 'string' ? parsed.url : '',
      filename: typeof parsed.filename === 'string' ? parsed.filename : '',
      enabled: Boolean(parsed.enabled),
      updatedAt:
        typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    }
  } catch {
    return { ...DEFAULT_RESUME_CONFIG }
  }
}

export function writeLocalResumeConfig(config: ResumeConfig): ResumeConfig {
  ensureDataDir()
  fs.writeFileSync(RESUME_DATA_FILE, JSON.stringify(config, null, 2), 'utf-8')
  return config
}

export async function getResumeConfigService(): Promise<ResumeConfig> {
  if (supabaseServerClient) {
    try {
      const { data, error } = await supabaseServerClient.storage
        .from('portfolio')
        .download('resumes/resume-config.json')

      if (!error && data) {
        const text = await data.text()
        const parsed = JSON.parse(text) as Partial<ResumeConfig>
        const config: ResumeConfig = {
          url: typeof parsed.url === 'string' ? parsed.url : '',
          filename: typeof parsed.filename === 'string' ? parsed.filename : '',
          enabled: Boolean(parsed.enabled),
          updatedAt:
            typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
        }
        writeLocalResumeConfig(config)
        return config
      }
    } catch {
      // Fallback para arquivo local
    }
  }

  return readLocalResumeConfig()
}

export async function updateResumeConfigService(
  partial: Partial<Omit<ResumeConfig, 'updatedAt'>>,
): Promise<ResumeConfig> {
  const current = await getResumeConfigService()
  const updated: ResumeConfig = {
    url: partial.url !== undefined ? partial.url : current.url,
    filename: partial.filename !== undefined ? partial.filename : current.filename,
    enabled: partial.enabled !== undefined ? partial.enabled : current.enabled,
    updatedAt: new Date().toISOString(),
  }

  writeLocalResumeConfig(updated)

  if (supabaseServerClient) {
    try {
      const buffer = Buffer.from(JSON.stringify(updated, null, 2), 'utf-8')
      await supabaseServerClient.storage
        .from('portfolio')
        .upload('resumes/resume-config.json', buffer, {
          contentType: 'application/json',
          upsert: true,
        })
    } catch {
      // Mantém persistência local caso o bucket não exista
    }
  }

  return updated
}
