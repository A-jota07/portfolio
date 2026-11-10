import { getStoredAuthToken } from './authService'

const BASE_URL = import.meta.env.VITE_API_URL || ''
const RESUME_ENDPOINT = `${BASE_URL}/api/upload/resume`
const STORAGE_KEY = 'portfolio_resume_config'
export const RESUME_UPDATED_EVENT = 'portfolio-resume-updated'

export interface ResumeConfig {
  url: string
  filename: string
  enabled: boolean
  updatedAt: string
}

const DEFAULT_CONFIG: ResumeConfig = {
  url: '',
  filename: '',
  enabled: false,
  updatedAt: new Date(0).toISOString(),
}

export function getCachedResumeConfig(): ResumeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw) as Partial<ResumeConfig>
    return {
      url: typeof parsed.url === 'string' ? parsed.url : '',
      filename: typeof parsed.filename === 'string' ? parsed.filename : '',
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
      updatedAt:
        typeof parsed.updatedAt === 'string'
          ? parsed.updatedAt
          : DEFAULT_CONFIG.updatedAt,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function saveCachedResumeConfig(config: ResumeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    window.dispatchEvent(new CustomEvent(RESUME_UPDATED_EVENT, { detail: config }))
  } catch {
    // Ignora erro de quota do localStorage
  }
}

export async function fetchResumeConfig(): Promise<ResumeConfig> {
  try {
    const response = await fetch(RESUME_ENDPOINT)
    if (response.ok) {
      const data = (await response.json()) as Partial<ResumeConfig>
      const normalized: ResumeConfig = {
        url: typeof data.url === 'string' ? data.url : '',
        filename: typeof data.filename === 'string' ? data.filename : '',
        enabled: typeof data.enabled === 'boolean' ? data.enabled : false,
        updatedAt:
          typeof data.updatedAt === 'string'
            ? data.updatedAt
            : new Date().toISOString(),
      }
      // Se o backend retornou vazio mas já temos um salvo localmente em fallback, preserva o local se for mais recente
      const local = getCachedResumeConfig()
      if (!normalized.url && local.url) {
        return local
      }
      saveCachedResumeConfig(normalized)
      return normalized
    }
  } catch {
    // Fallback offline para cache local
  }
  return getCachedResumeConfig()
}

export async function updateResumeConfig(
  partial: Partial<Pick<ResumeConfig, 'url' | 'filename' | 'enabled'>>,
): Promise<ResumeConfig> {
  const token = getStoredAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(RESUME_ENDPOINT, {
      method: 'PUT',
      headers,
      body: JSON.stringify(partial),
    })

    if (response.ok) {
      const updated = (await response.json()) as ResumeConfig
      saveCachedResumeConfig(updated)
      return updated
    }
  } catch {
    // Fallback para cache local quando API está offline
  }

  const current = getCachedResumeConfig()
  const fallbackUpdated: ResumeConfig = {
    url: partial.url !== undefined ? partial.url : current.url,
    filename: partial.filename !== undefined ? partial.filename : current.filename,
    enabled: partial.enabled !== undefined ? partial.enabled : current.enabled,
    updatedAt: new Date().toISOString(),
  }
  saveCachedResumeConfig(fallbackUpdated)
  return fallbackUpdated
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo PDF localmente.'))
    reader.readAsDataURL(file)
  })
}

export async function uploadResumePdf(file: File): Promise<ResumeConfig> {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    throw new Error('Por favor, selecione um arquivo de currículo em formato .pdf.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('O currículo excede o tamanho máximo permitido de 10MB.')
  }

  const formData = new FormData()
  formData.append('file', file)

  const token = getStoredAuthToken()
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(RESUME_ENDPOINT, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (response.ok) {
      const payload = (await response.json()) as {
        url: string
        filename: string
        config?: ResumeConfig
      }
      const nextConfig: ResumeConfig = payload.config ?? {
        url: payload.url,
        filename: payload.filename || file.name,
        enabled: true,
        updatedAt: new Date().toISOString(),
      }
      saveCachedResumeConfig(nextConfig)
      return nextConfig
    }

    const errData = (await response.json().catch(() => ({}))) as { error?: string }
    if (errData.error) {
      throw new Error(errData.error)
    }
  } catch (err) {
    // Se for um erro explícito de validação do servidor, repassa
    if (err instanceof Error && err.message.includes('tamanho')) {
      throw err
    }
    // Fallback local (Base64 Data URL) quando o backend não está acessível
    if (file.size <= 4 * 1024 * 1024) {
      const dataUrl = await fileToDataUrl(file)
      const localConfig: ResumeConfig = {
        url: dataUrl,
        filename: file.name,
        enabled: true,
        updatedAt: new Date().toISOString(),
      }
      saveCachedResumeConfig(localConfig)
      return localConfig
    }
    throw new Error(
      'Servidor indisponível e o arquivo excede 4MB para armazenamento em cache local.',
    )
  }

  throw new Error('Não foi possível concluir o envio do currículo PDF.')
}
