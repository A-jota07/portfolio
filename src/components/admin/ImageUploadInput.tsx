import React, { useState, useRef, useEffect } from 'react'
import { UploadCloud, Link as LinkIcon, X, Check, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { uploadImageFile, resolveImageUrl } from '@/services/uploadService'

interface ImageUploadInputProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUploadInput({
  value,
  onChange,
  label = 'Imagem de Capa',
}: ImageUploadInputProps) {
  // Define o modo inicial com base no valor atual da imagem
  const isExternalUrl = value.startsWith('http://') || value.startsWith('https://')
  const [mode, setMode] = useState<'upload' | 'url'>(isExternalUrl ? 'url' : 'upload')

  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      // Mantém 'url' se for uma imagem de URL externa
    }
  }, [value])

  const handleFileUpload = async (file: File) => {
    setUploadError(null)

    // Validação básica do tipo de arquivo no lado do cliente
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (.jpg, .png, .webp, etc).')
      return
    }

    // Validação do tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo é muito grande. O tamanho máximo permitido é 5MB.')
      return
    }

    // Pré-visualização instantânea local via Blob URL
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setIsUploading(true)
    try {
      const response = await uploadImageFile(file)
      onChange(response.url)
      setUploadError(null)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha ao enviar a imagem para o servidor.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleClear = () => {
    onChange('')
    setLocalPreview(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // URL final para exibição no preview
  const displayUrl = localPreview || (value ? resolveImageUrl(value) : '')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-surface-700">{label}</label>

        {/* Toggle / Abas entre Upload e URL Externa */}
        <div className="inline-flex rounded-lg bg-surface-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('upload')
              setUploadError(null)
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              mode === 'upload'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload de Arquivo
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('url')
              setUploadError(null)
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
              mode === 'url'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            URL Externa
          </button>
        </div>
      </div>

      {/* Modo 1: Upload de Arquivo Local (Drag and Drop / Button) */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
            onChange={handleFileChange}
            className="hidden"
            id="cover-image-file-input"
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-accent-500 bg-accent-50/50'
                : 'border-surface-200 bg-surface-50/50 hover:border-surface-300 hover:bg-surface-100/50'
            } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center py-2 space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
                <p className="text-sm font-medium text-surface-700">Enviando imagem para o servidor...</p>
                <p className="text-xs text-surface-500">Por favor, aguarde.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                <div className="mb-3 rounded-full bg-white p-3 shadow-sm border border-surface-200">
                  <UploadCloud className="h-6 w-6 text-accent-600" />
                </div>
                <p className="text-sm font-medium text-surface-800">
                  Arraste e solte uma imagem aqui, ou{' '}
                  <span className="text-accent-600 font-semibold underline underline-offset-2">
                    clique para navegar
                  </span>
                </p>
                <p className="mt-1 text-xs text-surface-500">
                  Suporta JPG, PNG, WebP, GIF ou SVG (máx. 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modo 2: URL Externa */}
      {mode === 'url' && (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setLocalPreview(null)
            }}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent-400/40"
          />
        </div>
      )}

      {/* Erros de upload ou validação */}
      {uploadError && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Visualização Prévia (Preview) da Imagem */}
      {displayUrl && (
        <div className="relative overflow-hidden rounded-xl border border-surface-200 bg-surface-900/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-surface-600">
              <ImageIcon className="h-3.5 w-3.5 text-accent-600" />
              Pré-visualização da imagem
              {value && !isUploading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="h-3 w-3" />
                  Pronta
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs font-medium text-surface-600 hover:text-accent-600"
              >
                <RefreshCw className="h-3 w-3" />
                Trocar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
              >
                <X className="h-3.5 w-3.5" />
                Remover
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-surface-200 bg-white">
            <img
              src={displayUrl}
              alt="Pré-visualização"
              className="h-full w-full object-cover"
              onError={() => {
                setUploadError('Não foi possível carregar a imagem da URL fornecida.')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
