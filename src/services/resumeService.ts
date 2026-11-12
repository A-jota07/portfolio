import { getStoredAuthToken } from './authService'
import { supabaseClient } from './supabaseClient'

const BASE_URL = (import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')
const RESUME_ENDPOINT = `${BASE_URL}/api/upload/resume`
const STORAGE_KEY = 'portfolio_resume_config'
const SUPABASE_CONFIG_PATH = 'resumes/resume-config.json'
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
  // 1. Tenta buscar do Backend na Render
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
      if (normalized.url) {
        saveCachedResumeConfig(normalized)
        return normalized
      }
    }
  } catch {
    // Continua para o Supabase Storage
  }

  // 2. Fallback direto no Supabase Storage (conectado na Vercel)
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.storage
        .from('portfolio')
        .download(SUPABASE_CONFIG_PATH)

      if (!error && data) {
        const text = await data.text()
        const parsed = JSON.parse(text) as Partial<ResumeConfig>
        if (typeof parsed.url === 'string') {
          const remoteConfig: ResumeConfig = {
            url: parsed.url,
            filename: typeof parsed.filename === 'string' ? parsed.filename : 'curriculo.pdf',
            enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
            updatedAt:
              typeof parsed.updatedAt === 'string'
                ? parsed.updatedAt
                : new Date().toISOString(),
          }
          saveCachedResumeConfig(remoteConfig)
          return remoteConfig
        }
      }
    } catch {
      // Continua para o cache local
    }
  }

  return getCachedResumeConfig()
}

async function syncConfigToSupabase(config: ResumeConfig): Promise<void> {
  if (!supabaseClient) return
  try {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    })
    await supabaseClient.storage.from('portfolio').upload(SUPABASE_CONFIG_PATH, blob, {
      contentType: 'application/json',
      upsert: true,
    })
  } catch {
    // Ignora erro se bucket não permitir escrita direta pelo cliente
  }
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
    // Fallback para Supabase / cache local quando Render está em cold start
  }

  const current = getCachedResumeConfig()
  const fallbackUpdated: ResumeConfig = {
    url: partial.url !== undefined ? partial.url : current.url,
    filename: partial.filename !== undefined ? partial.filename : current.filename,
    enabled: partial.enabled !== undefined ? partial.enabled : current.enabled,
    updatedAt: new Date().toISOString(),
  }
  await syncConfigToSupabase(fallbackUpdated)
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

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mimeMatch = parts[0]?.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf'
  const bstr = atob(parts[1] || '')
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

export function resolvePdfViewerUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('data:application/pdf') || url.startsWith('data:')) {
    try {
      const blob = dataUrlToBlob(url)
      return URL.createObjectURL(blob)
    } catch {
      return url
    }
  }
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:')
  ) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return BASE_URL ? `${BASE_URL}/api/upload/resume/view` : '/api/upload/resume/view'
  }
  return `${BASE_URL}${url}`
}

export function openPdfInNewTab(url?: string): void {
  if (!url) return
  const targetUrl = resolvePdfViewerUrl(url)
  if (!targetUrl) return
  window.open(targetUrl, '_blank', 'noopener,noreferrer')
}

export function downloadPdfFile(url?: string, filename = 'curriculo.pdf'): void {
  if (!url) return
  const targetUrl = resolvePdfViewerUrl(url)
  const a = document.createElement('a')
  a.href = targetUrl
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
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

  // 1. PRIORIDADE SUPABASE STORAGE: Se conectado diretamente no front-end (Vercel)
  if (supabaseClient) {
    try {
      const storagePath = `resumes/cv-${Date.now()}.pdf`
      const { error: upErr } = await supabaseClient.storage
        .from('portfolio')
        .upload(storagePath, file, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (!upErr) {
        const { data: pubData } = supabaseClient.storage
          .from('portfolio')
          .getPublicUrl(storagePath)

        if (pubData?.publicUrl) {
          const supaConfig: ResumeConfig = {
            url: pubData.publicUrl,
            filename: file.name,
            enabled: true,
            updatedAt: new Date().toISOString(),
          }
          await syncConfigToSupabase(supaConfig)
          saveCachedResumeConfig(supaConfig)

          // Notifica a API na Render em background para sincronizar
          const token = getStoredAuthToken()
          const headers: HeadersInit = { 'Content-Type': 'application/json' }
          if (token) headers['Authorization'] = `Bearer ${token}`
          void fetch(RESUME_ENDPOINT, {
            method: 'PUT',
            headers,
            body: JSON.stringify(supaConfig),
          }).catch(() => {})

          return supaConfig
        }
      }
    } catch {
      // Prossegue para tentativa via backend na Render
    }
  }

  // 2. BACKEND EXPRESS NA RENDER
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
    if (err instanceof Error && err.message.includes('tamanho')) {
      throw err
    }
  }

  // 3. FALLBACK LOCAL (Data URL Base64) quando offline / sem rede
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

  throw new Error('Não foi possível concluir o envio do currículo PDF.')
}
