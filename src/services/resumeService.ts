import { getStoredAuthToken } from './authService'

export interface ResumeInfo {
  url: string
  filename: string
  size?: number
  updatedAt?: string
  isCustom?: boolean
}

const STORAGE_KEY = 'portfolio_resume_meta'
const BASE_URL = import.meta.env.VITE_API_URL || ''
const API_RESUME = `${BASE_URL}/api/resume`

export const DEFAULT_RESUME: ResumeInfo = {
  url: '/curriculo.pdf',
  filename: 'Curriculo_Alexandre_Junior.pdf',
  size: 3840,
  updatedAt: new Date().toISOString(),
  isCustom: false,
}

export function getLocalStoredResume(): ResumeInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ResumeInfo
      if (parsed && typeof parsed.url === 'string') {
        return parsed
      }
    }
  } catch {
    // Falha silenciosa no parsing
  }
  return DEFAULT_RESUME
}

export function saveLocalStoredResume(data: ResumeInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Falha silenciosa se quota excedida
  }
}

export function resolveResumeUrl(url?: string): string {
  if (!url) return '/curriculo.pdf'
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url
  }
  // Se for caminho relativo /uploads/ e houver BASE_URL da API
  if (url.startsWith('/uploads/') && BASE_URL) {
    return `${BASE_URL}${url}`
  }
  return url
}

export async function fetchResumeInfo(): Promise<ResumeInfo> {
  try {
    const res = await fetch(API_RESUME, { method: 'GET' })
    if (res.ok) {
      const json = (await res.json()) as { data?: ResumeInfo }
      if (json.data && json.data.url) {
        saveLocalStoredResume(json.data)
        return json.data
      }
    }
  } catch {
    // API offline ou rodando front estático puro
  }

  return getLocalStoredResume()
}

export async function uploadResumeFile(file: File): Promise<ResumeInfo> {
  const token = getStoredAuthToken()
  const formData = new FormData()
  formData.append('file', file)

  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(API_RESUME, {
      method: 'POST',
      body: formData,
      headers,
    })

    if (response.ok) {
      const json = (await response.json()) as { data: ResumeInfo }
      saveLocalStoredResume(json.data)
      return json.data
    } else {
      const err = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error || 'Falha ao processar upload no servidor.')
    }
  } catch (error) {
    // Fallback: se o backend não estiver respondendo, converte para DataURL local para não travar o admin
    if (file.size <= 4 * 1024 * 1024) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const fallbackData: ResumeInfo = {
            url: dataUrl,
            filename: file.name,
            size: file.size,
            updatedAt: new Date().toISOString(),
            isCustom: true,
          }
          saveLocalStoredResume(fallbackData)
          resolve(fallbackData)
        }
        reader.onerror = () => {
          reject(error instanceof Error ? error : new Error('Falha ao ler o arquivo localmente.'))
        }
        reader.readAsDataURL(file)
      })
    }
    throw error
  }
}

export async function setResumeExternalUrl(url: string, filename?: string): Promise<ResumeInfo> {
  const token = getStoredAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(API_RESUME, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, filename }),
    })

    if (response.ok) {
      const json = (await response.json()) as { data: ResumeInfo }
      saveLocalStoredResume(json.data)
      return json.data
    }
  } catch {
    // Fallback
  }

  const fallbackData: ResumeInfo = {
    url,
    filename: filename || 'Curriculo_Alexandre_Junior.pdf',
    updatedAt: new Date().toISOString(),
    isCustom: true,
  }
  saveLocalStoredResume(fallbackData)
  return fallbackData
}

export async function resetResume(): Promise<ResumeInfo> {
  const token = getStoredAuthToken()
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    await fetch(API_RESUME, {
      method: 'DELETE',
      headers,
    })
  } catch {
    // Fallback
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignora
  }

  return DEFAULT_RESUME
}

export async function downloadResumeFile(resumeInfo?: ResumeInfo): Promise<void> {
  const info = resumeInfo || getLocalStoredResume()
  const targetUrl = resolveResumeUrl(info.url)
  const filename = info.filename || 'Curriculo_Alexandre_Junior.pdf'

  // Para data URLs e URLs relativas do mesmo domínio
  if (targetUrl.startsWith('data:') || targetUrl.startsWith('/') || targetUrl.startsWith('blob:')) {
    const a = document.createElement('a')
    a.href = targetUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  // Para URLs remotas (HTTP / HTTPS), tentar fetch para contornar restrições de cross-origin do atributo download
  try {
    const response = await fetch(targetUrl, { mode: 'cors' })
    if (response.ok) {
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      return
    }
  } catch {
    // Se o fetch falhar por CORS, abre diretamente
  }

  const fallbackLink = document.createElement('a')
  fallbackLink.href = targetUrl
  fallbackLink.target = '_blank'
  fallbackLink.rel = 'noopener noreferrer'
  fallbackLink.download = filename
  document.body.appendChild(fallbackLink)
  fallbackLink.click()
  document.body.removeChild(fallbackLink)
}
