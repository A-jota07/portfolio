import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  Link as LinkIcon,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react'
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
  const isExternalUrl = value.startsWith('http://') || value.startsWith('https://')
  const [mode, setMode] = useState<'upload' | 'url'>(isExternalUrl ? 'url' : 'upload')

  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setUploadError(null)

    if (!file.type.startsWith('image/')) {
      setUploadError(
        'Por favor, selecione um arquivo de imagem válido (.jpg, .png, .webp, etc).',
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo é muito grande. O tamanho máximo permitido é 5MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setIsUploading(true)
    try {
      const response = await uploadImageFile(file)
      onChange(response.url)
      setUploadError(null)
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Falha ao enviar a imagem para o servidor.',
      )
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

  const displayUrl = localPreview || (value ? resolveImageUrl(value) : '')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block font-mono text-xs font-medium text-surface-700">
          {label}
        </label>

        <div className="inline-flex rounded-xl border border-surface-200 bg-surface-100 p-0.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('upload')
              setUploadError(null)
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-surface-50 text-surface-900 font-semibold shadow-sm'
                : 'text-surface-500 hover:text-surface-900'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5 text-accent-400" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('url')
              setUploadError(null)
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              mode === 'url'
                ? 'bg-surface-50 text-surface-900 font-semibold shadow-sm'
                : 'text-surface-500 hover:text-surface-900'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5 text-accent-400" />
            URL Externa
          </button>
        </div>
      </div>

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
                ? 'border-accent-400 bg-accent-500/10'
                : 'border-surface-200 bg-surface-50/70 hover:border-accent-400/50 hover:bg-surface-100/50'
            } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2 py-2">
                <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
                <p className="text-sm font-medium text-surface-700">
                  Enviando imagem para o servidor...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                <div className="mb-3 rounded-full border border-surface-200 bg-surface-100 p-3">
                  <UploadCloud className="h-6 w-6 text-accent-400" />
                </div>
                <p className="text-sm font-medium text-surface-800">
                  Arraste uma imagem aqui ou{' '}
                  <span className="font-semibold text-accent-400 underline underline-offset-2">
                    clique para navegar
                  </span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-surface-500">
                  JPG, PNG, WebP, GIF, SVG ou AVIF (máx. 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
            className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 outline-none focus:border-accent-400"
          />
        </div>
      )}

      {uploadError && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-400">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {displayUrl && (
        <div className="relative overflow-hidden rounded-xl border border-surface-200 bg-surface-100/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-xs text-surface-600">
              <ImageIcon className="h-3.5 w-3.5 text-accent-400" />
              Preview
              {value && !isUploading && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <Check className="h-3 w-3" />
                  Pronta
                </span>
              )}
            </span>
            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-surface-600 hover:text-accent-400 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Trocar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Remover
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-surface-200 bg-surface-50">
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
