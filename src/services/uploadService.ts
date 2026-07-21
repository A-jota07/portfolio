import { getStoredAuthToken } from './authService'

const BASE_URL = import.meta.env.VITE_API_URL || ''
const UPLOAD_ENDPOINT = `${BASE_URL}/api/upload`

export interface UploadResponse {
  url: string
  filename?: string
  mimetype?: string
  size?: number
}

export async function uploadImageFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const token = getStoredAuthToken()
  const headers: HeadersInit = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers,
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(errorData.error || 'Falha ao realizar o upload da imagem.')
  }

  return (await response.json()) as UploadResponse
}

export function resolveImageUrl(url?: string): string {
  if (!url) return ''
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url
  }
  return `${BASE_URL}${url}`
}
