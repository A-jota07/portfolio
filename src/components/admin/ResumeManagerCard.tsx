import React, { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import {
  downloadPdfFile,
  fetchResumeConfig,
  getCachedResumeConfig,
  openPdfInNewTab,
  resolvePdfViewerUrl,
  RESUME_UPDATED_EVENT,
  updateResumeConfig,
  uploadResumePdf,
  type ResumeConfig,
} from '@/services/resumeService'

export function ResumeManagerCard() {
  const [config, setConfig] = useState<ResumeConfig>(() => getCachedResumeConfig())
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showEmbeddedPreview, setShowEmbeddedPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  useEffect(() => {
    let active = true
    void fetchResumeConfig().then((remote) => {
      if (active) setConfig(remote)
    })

    const handleUpdated = (event: Event) => {
      const custom = event as CustomEvent<ResumeConfig>
      if (custom.detail) {
        setConfig(custom.detail)
      } else {
        setConfig(getCachedResumeConfig())
      }
    }

    window.addEventListener(RESUME_UPDATED_EVENT, handleUpdated)
    return () => {
      active = false
      window.removeEventListener(RESUME_UPDATED_EVENT, handleUpdated)
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const next = await uploadResumePdf(file)
      setConfig(next)
      toast.success('Currículo em PDF enviado e ativado no site!')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao fazer upload do currículo PDF.',
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleToggleEnabled = async () => {
    if (!config.url) return
    setIsUpdating(true)
    try {
      const next = await updateResumeConfig({ enabled: !config.enabled })
      setConfig(next)
      toast.success(
        next.enabled
          ? 'Botão e currículo ativados no site público!'
          : 'Botão e currículo ocultados do site público.',
      )
    } catch {
      toast.error('Não foi possível alterar a visibilidade do currículo.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveResume = async () => {
    if (!config.url) return
    setIsUpdating(true)
    try {
      const next = await updateResumeConfig({
        url: '',
        filename: '',
        enabled: false,
      })
      setConfig(next)
      setShowEmbeddedPreview(false)
      toast.info('Currículo removido e botão desativado.')
    } catch {
      toast.error('Não foi possível remover o currículo.')
    } finally {
      setIsUpdating(false)
    }
  }

  const hasResume = Boolean(config.url)
  const resolvedPdfUrl = hasResume ? resolvePdfViewerUrl(config.url) : ''

  return (
    <div className="bento-card mb-8 rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-accent-400">
              <FileText className="h-3.5 w-3.5" />
              <span>// curriculo_pdf</span>
            </span>

            {hasResume ? (
              config.enabled ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  ATIVO NO SITE PÚBLICO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
                  <EyeOff className="h-3 w-3" />
                  BOTÃO E CURRÍCULO DESATIVADOS
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-surface-300 bg-surface-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-surface-500">
                NENHUM PDF ENVIADO
              </span>
            )}
          </div>

          <h2 className="font-display text-lg font-bold text-surface-900">
            Currículo em PDF (Botão ao lado de &ldquo;Contratar / Conversar&rdquo;)
          </h2>
          <p className="text-xs text-surface-500">
            Adicione seu currículo em <code className="font-mono text-accent-400">.pdf</code>, visualize o documento ou desative o botão para ocultá-lo do portfólio público quando desejar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="admin-resume-pdf-input"
          />

          <Button
            type="button"
            variant={hasResume ? 'secondary' : 'primary'}
            magnetic={false}
            disabled={isUploading || isUpdating}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4 text-accent-400" />
            )}
            <span>{hasResume ? 'Substituir PDF' : 'Enviar Currículo (.pdf)'}</span>
          </Button>

          {hasResume && (
            <>
              <Button
                type="button"
                variant="secondary"
                magnetic={false}
                onClick={() => setShowEmbeddedPreview((prev) => !prev)}
              >
                <Eye className="h-4 w-4 text-accent-400" />
                <span>{showEmbeddedPreview ? 'Fechar Visualização' : 'Visualizar PDF'}</span>
              </Button>

              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (config.url?.startsWith('data:')) {
                    e.preventDefault()
                    openPdfInNewTab(config.url)
                  }
                }}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-surface-200 bg-surface-100/80 px-3.5 py-2 font-mono text-xs font-medium text-surface-700 transition-colors hover:border-accent-400/50 hover:text-surface-900"
              >
                <FileText className="h-3.5 w-3.5 text-accent-400" />
                <span>Abrir em Nova Aba</span>
              </a>

              <Button
                type="button"
                variant="secondary"
                magnetic={false}
                onClick={() => downloadPdfFile(config.url, config.filename)}
                title="Baixar arquivo PDF do currículo"
              >
                <Download className="h-4 w-4 text-accent-400" />
                <span>Baixar</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                magnetic={false}
                disabled={isUpdating || isUploading}
                onClick={() => void handleToggleEnabled()}
              >
                {config.enabled ? (
                  <>
                    <EyeOff className="h-4 w-4 text-amber-400" />
                    <span>Desativar Botão</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Ativar Botão</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                disabled={isUpdating || isUploading}
                onClick={() => void handleRemoveResume()}
                title="Remover currículo PDF"
                aria-label="Remover currículo PDF"
                className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {hasResume && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-surface-200/80 bg-surface-50/70 px-4 py-2.5 font-mono text-xs text-surface-600">
          <div className="flex items-center gap-2 truncate">
            <FileText className="h-4 w-4 shrink-0 text-accent-400" />
            <span className="truncate font-semibold text-surface-900">
              {config.filename || 'curriculo.pdf'}
            </span>
          </div>
          <span className="text-[11px] text-surface-500">
            Status no Hero:{' '}
            <strong className={config.enabled ? 'text-emerald-400' : 'text-amber-400'}>
              {config.enabled ? 'Visível para visitantes' : 'Oculto para visitantes'}
            </strong>
          </span>
        </div>
      )}

      {hasResume && showEmbeddedPreview && (
        <div className="mt-4 overflow-hidden rounded-xl border border-surface-200 bg-surface-50">
          <div className="flex items-center justify-between border-b border-surface-200 bg-surface-100 px-4 py-2 font-mono text-xs text-surface-600">
            <span>Pré-visualização do Currículo ({config.filename || 'curriculo.pdf'})</span>
            <a
              href={resolvedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (config.url?.startsWith('data:')) {
                  e.preventDefault()
                  openPdfInNewTab(config.url)
                }
              }}
              className="text-accent-400 hover:underline"
            >
              Abrir tela cheia ↗
            </a>
          </div>
          <iframe
            src={resolvedPdfUrl}
            title="Visualização do Currículo em PDF"
            className="h-[520px] w-full bg-surface-50"
          />
        </div>
      )}
    </div>
  )
}
