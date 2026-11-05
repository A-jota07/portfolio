import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_RESUME,
  downloadResumeFile,
  fetchResumeInfo,
  getLocalStoredResume,
  resetResume,
  setResumeExternalUrl,
  uploadResumeFile,
  type ResumeInfo,
} from '@/services/resumeService'

export function useResume() {
  const [resume, setResume] = useState<ResumeInfo>(() => getLocalStoredResume())
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadResume = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchResumeInfo()
      setResume(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar currículo.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadResume()
  }, [loadResume])

  const download = useCallback(async () => {
    setIsDownloading(true)
    try {
      await downloadResumeFile(resume)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar o currículo.')
    } finally {
      setIsDownloading(false)
    }
  }, [resume])

  const upload = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)
    try {
      const updated = await uploadResumeFile(file)
      setResume(updated)
      return updated
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar upload do currículo.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const updateUrl = useCallback(async (url: string, filename?: string) => {
    setIsUploading(true)
    setError(null)
    try {
      const updated = await setResumeExternalUrl(url, filename)
      setResume(updated)
      return updated
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar link do currículo.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const restoreDefault = useCallback(async () => {
    setIsUploading(true)
    setError(null)
    try {
      const updated = await resetResume()
      setResume(updated)
      return updated
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao restaurar currículo padrão.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    resume: resume || DEFAULT_RESUME,
    isLoading,
    isDownloading,
    isUploading,
    error,
    download,
    upload,
    updateUrl,
    restoreDefault,
    refresh: loadResume,
  }
}
