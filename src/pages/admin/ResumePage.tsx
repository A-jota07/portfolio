import { useState, useRef, useMemo, type DragEvent, type ChangeEvent } from 'react'
import {
  FileText,
  UploadCloud,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Link as LinkIcon,
  FileCheck,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useResume } from '@/hooks/useResume'
import { resolveResumeUrl, dataUrlToBlob } from '@/services/resumeService'

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Tamanho não informado'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Recente'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function ResumePage() {
  const {
    resume,
    isLoading,
    isDownloading,
    isUploading,
    view,
    download,
    upload,
    updateUrl,
    restoreDefault,
    refresh,
  } = useResume()

  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [showInlinePreview, setShowInlinePreview] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const previewSrc = useMemo(() => {
    if (!resume.url) return '/curriculo.pdf'
    if (resume.url.startsWith('data:')) {
      try {
        const blob = dataUrlToBlob(resume.url)
        return URL.createObjectURL(blob)
      } catch {
        return resume.url
      }
    }
    if (resume.url.startsWith('/uploads/')) {
      return '/api/resume/view'
    }
    return resolveResumeUrl(resume.url)
  }, [resume.url])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      validateAndSetFile(file)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    setFeedback(null)
    const validExtensions = ['.pdf', '.docx', '.doc']
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    )

    if (!hasValidExt) {
      setFeedback({
        type: 'error',
        message: 'Formato inválido. Por favor, selecione um arquivo PDF (.pdf) ou Word (.docx).',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'O arquivo excede o limite máximo permitido de 10 MB.',
      })
      return
    }

    setSelectedFile(file)
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile) return
    setFeedback(null)
    try {
      await upload(selectedFile)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setFeedback({
        type: 'success',
        message: 'Currículo atualizado com sucesso no site e no backend!',
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Erro ao fazer upload do currículo. Tente novamente.',
      })
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    setFeedback(null)

    try {
      new URL(urlInput)
    } catch {
      setFeedback({
        type: 'error',
        message: 'Informe uma URL válida (ex: https://...).',
      })
      return
    }

    try {
      await updateUrl(urlInput.trim())
      setUrlInput('')
      setFeedback({
        type: 'success',
        message: 'Link do currículo configurado com sucesso!',
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao salvar o link.',
      })
    }
  }

  const handleRestoreDefault = async () => {
    if (
      !window.confirm(
        'Deseja restaurar o currículo para o padrão original do sistema?',
      )
    ) {
      return
    }

    setFeedback(null)
    try {
      await restoreDefault()
      setFeedback({
        type: 'success',
        message: 'Currículo restaurado para o arquivo padrão.',
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao restaurar.',
      })
    }
  }

  const resolvedUrl = resolveResumeUrl(resume.url)

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-accent-400">
              <FileText className="h-3.5 w-3.5" />
              <span>// gerenciador_de_curriculo</span>
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                resume.isCustom
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
              }`}
            >
              {resume.isCustom ? '● UPLOAD PERSONALIZADO' : '● PADRÃO DO SISTEMA'}
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-surface-900">
            Gerenciar Currículo (CV)
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Adicione ou substitua o currículo em PDF disponível para download na
            página inicial do portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            magnetic={false}
            onClick={() => void refresh()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Status</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          role="alert"
          className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm font-mono ${
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/40 bg-red-500/10 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {feedback.type === 'success' ? 'Operação realizada com sucesso' : 'Erro no processamento'}
            </p>
            <p className="mt-0.5 text-xs text-surface-400">{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-surface-400 hover:text-surface-200 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Coluna 1: Currículo Ativo Atual */}
        <div className="lg:col-span-5">
          <div className="bento-card flex h-full flex-col justify-between rounded-2xl border border-surface-200/80 bg-surface-100/60 p-6 backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between border-b border-surface-200/60 pb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-surface-500">
                  Arquivo Atual em Produção
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-accent-400/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent-400">
                  <Sparkles className="h-3 w-3" />
                  Ativo no Site
                </span>
              </div>

              {/* Box de Pré-visualização do Documento */}
              <div className="mt-5 rounded-xl border border-surface-200 bg-surface-50/70 p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400 border border-accent-400/20">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-mono text-sm font-bold text-surface-900" title={resume.filename}>
                      {resume.filename}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-surface-500">
                      <span>{formatBytes(resume.size)}</span>
                      <span>•</span>
                      <span>Atualizado: {formatDate(resume.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-surface-200/50 pt-3">
                  <p className="font-mono text-[11px] text-surface-400">
                    <span className="text-surface-500">Origem:</span>{' '}
                    {resume.isCustom ? 'Personalizado pelo Admin' : 'Padrão /curriculo.pdf'}
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-surface-500" title={resolvedUrl}>
                    <span className="text-surface-400">Destino:</span> {resolvedUrl}
                  </p>
                </div>
              </div>
            </div>

            {/* Ações do Currículo Atual */}
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="w-full justify-center text-xs"
                  magnetic={false}
                  onClick={() => view()}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Abrir em Nova Aba</span>
                </Button>

                <Button
                  variant="primary"
                  className="w-full justify-center text-xs"
                  magnetic={false}
                  onClick={() => void download()}
                  disabled={isDownloading}
                >
                  <Download className={`h-3.5 w-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'Baixando...' : 'Baixar CV'}</span>
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full justify-center text-xs border-accent-400/30 hover:border-accent-400/70"
                magnetic={false}
                onClick={() => setShowInlinePreview((prev) => !prev)}
              >
                {showInlinePreview ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-accent-400" />
                    <span>Ocultar Pré-visualização</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-accent-400" />
                    <span>Pré-visualizar na Tela</span>
                  </>
                )}
              </Button>

              {resume.isCustom && (
                <Button
                  variant="ghost"
                  className="w-full justify-center text-xs text-surface-500 hover:text-amber-400"
                  magnetic={false}
                  onClick={() => void handleRestoreDefault()}
                  disabled={isUploading}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restaurar Padrão do Sistema</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Formulário de Adicionar / Upload de Currículo */}
        <div className="lg:col-span-7">
          <div className="bento-card rounded-2xl border border-surface-200/80 bg-surface-100/60 p-6 backdrop-blur-xl">
            {/* Seletor de método */}
            <div className="mb-6 flex items-center gap-2 border-b border-surface-200/60 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-accent-500 text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-900 hover:bg-surface-200/50'
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload de Arquivo (.pdf / .docx)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-accent-500 text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-900 hover:bg-surface-200/50'
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Link Externo</span>
              </button>
            </div>

            {/* Aba 1: Upload por Drag and Drop */}
            {activeTab === 'upload' ? (
              <div>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                    dragActive
                      ? 'border-accent-400 bg-accent-500/10 scale-[1.01]'
                      : 'border-surface-300 hover:border-accent-400/70 hover:bg-surface-200/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-200 text-accent-400 shadow-inner">
                    <UploadCloud className="h-7 w-7" />
                  </div>

                  <p className="mt-4 font-mono text-sm font-semibold text-surface-900">
                    Arraste e solte o currículo aqui, ou{' '}
                    <span className="text-accent-400 underline underline-offset-4">procure no computador</span>
                  </p>
                  <p className="mt-1 font-mono text-xs text-surface-500">
                    Formatos aceitos: PDF (.pdf) ou Word (.docx) • Tamanho máximo: 10 MB
                  </p>
                </div>

                {/* Arquivo Selecionado Pronto para Envio */}
                {selectedFile && (
                  <div className="mt-4 rounded-xl border border-accent-400/40 bg-accent-500/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileCheck className="h-5 w-5 text-accent-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-bold text-surface-900">
                            {selectedFile.name}
                          </p>
                          <p className="font-mono text-xs text-surface-500">
                            {formatBytes(selectedFile.size)} • Pronto para salvar
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="font-mono text-xs text-surface-400 hover:text-surface-200 cursor-pointer px-2 py-1"
                        >
                          Cancelar
                        </button>
                        <Button
                          variant="primary"
                          magnetic={false}
                          onClick={() => void handleUploadSubmit()}
                          disabled={isUploading}
                        >
                          <UploadCloud className={`h-4 w-4 ${isUploading ? 'animate-spin' : ''}`} />
                          <span>{isUploading ? 'Enviando...' : 'Publicar Currículo'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Aba 2: Inserir Link Externo */
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <label htmlFor="urlInput" className="block font-mono text-xs font-semibold text-surface-700">
                    URL Direta do Currículo
                  </label>
                  <p className="mt-0.5 text-xs text-surface-500">
                    Cole um link direto para seu PDF (Google Drive com link público, Dropbox, AWS S3, etc.)
                  </p>
                  <input
                    id="urlInput"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/meu-curriculo.pdf"
                    className="mt-2 w-full rounded-xl border border-surface-300 bg-surface-50 px-4 py-2.5 font-mono text-xs text-surface-900 placeholder-surface-400 focus:border-accent-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    magnetic={false}
                    disabled={isUploading || !urlInput.trim()}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Salvar Link do Currículo</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Dica de Boas Práticas */}
            <div className="mt-6 rounded-xl border border-surface-200/80 bg-surface-50/50 p-4">
              <h4 className="font-mono text-xs font-bold text-surface-800">
                💡 Dica para Recrutadores & ATS:
              </h4>
              <p className="mt-1 text-xs text-surface-500 leading-relaxed">
                Recomendamos manter o currículo em formato <strong>PDF</strong> com texto selecionável e nome padronizado
                (ex: <code>Curriculo_Alexandre_Junior.pdf</code>). Assim que publicado aqui, qualquer visitante poderá baixá-lo diretamente pelo botão na Hero da página inicial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizador Embutido na Tela (Garante visualização nativa imediata) */}
      {showInlinePreview && (
        <div className="mt-8 rounded-2xl border border-surface-200/80 bg-surface-100/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-accent-400" />
              <h3 className="font-mono text-sm font-bold text-surface-900">
                // visualizador_documento_ativo ({resume.filename})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="text-xs px-2.5 py-1"
                onClick={() => view()}
                magnetic={false}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Abrir Externo</span>
              </Button>
              <button
                type="button"
                onClick={() => setShowInlinePreview(false)}
                className="font-mono text-xs text-surface-400 hover:text-surface-200 cursor-pointer px-2 py-1"
              >
                ✕ Fechar
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-900/90 shadow-2xl">
            <object
              data={previewSrc}
              type="application/pdf"
              className="h-[750px] w-full"
            >
              <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                <FileText className="h-10 w-10 text-accent-400 mb-3" />
                <p className="font-mono text-sm text-surface-200">
                  Visualização embutida não suportada diretamente pelo seu navegador.
                </p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => view()}
                  magnetic={false}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Abrir Documento na Nova Aba</span>
                </Button>
              </div>
            </object>
          </div>
        </div>
      )}
    </div>
  )
}
