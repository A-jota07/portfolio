import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import type { ProjectInput } from '@/types/project'
import { Button } from '@/components/ui/Button'
import { MarkdownRenderer } from '@/components/portfolio/MarkdownRenderer'
import { Editor } from './Editor'
import { TagSelect } from './TagSelect'
import { ImageUploadInput } from './ImageUploadInput'

interface ProjectFormProps {
  initialData?: Partial<ProjectInput>
  onSubmit: (data: ProjectInput) => void | Promise<void>
  submitLabel?: string
}

const emptyForm: ProjectInput = {
  title: '',
  summary: '',
  coverImage: '',
  tags: [],
  content: '',
  featured: false,
  repositoryUrl: '',
}

export function ProjectForm({
  initialData,
  onSubmit,
  submitLabel = 'Salvar Projeto',
}: ProjectFormProps) {
  const [form, setForm] = useState<ProjectInput>({ ...emptyForm, ...initialData })
  const [showPreview, setShowPreview] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.coverImage) {
      setFormError(
        'Por favor, faça o upload de uma imagem de capa ou informe uma URL externa.',
      )
      return
    }

    setIsSaving(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erro ao sincronizar projeto com o servidor.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
          {formError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bento-card space-y-4 rounded-2xl p-6">
          <div>
            <label className="mb-1.5 block font-mono text-xs font-medium text-surface-700">
              Título
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 outline-none transition-colors focus:border-accent-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs font-medium text-surface-700">
              Resumo
            </label>
            <textarea
              required
              rows={3}
              value={form.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-900 outline-none transition-colors focus:border-accent-400"
            />
          </div>

          <ImageUploadInput
            value={form.coverImage}
            onChange={(url) => updateField('coverImage', url)}
          />

          <div>
            <label className="mb-1.5 flex items-center justify-between font-mono text-xs font-medium text-surface-700">
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-accent-400" />
                <span>Repositório (GitHub / GitLab)</span>
              </span>
              <span className="font-normal text-surface-400">opcional</span>
            </label>
            <input
              type="url"
              value={form.repositoryUrl || ''}
              onChange={(e) => updateField('repositoryUrl', e.target.value)}
              placeholder="https://github.com/usuario/repositorio"
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 font-mono text-sm text-surface-900 outline-none transition-colors focus:border-accent-400 placeholder:text-surface-400"
            />
            <p className="mt-1 font-mono text-[11px] text-surface-500">
              Se preenchido, um link direto para o repositório será exibido no post do projeto.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs font-medium text-surface-700">
              Linguagens e Tecnologias
            </label>
            <TagSelect
              selectedTags={form.tags}
              onChange={(tags) => updateField('tags', tags)}
              placeholder="Buscar ou adicionar tecnologias (ex: React, TypeScript, D3.js)..."
            />
          </div>
          <label className="flex items-center gap-2 font-mono text-xs text-surface-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="rounded border-surface-300 accent-accent-500"
            />
            Projeto em destaque na página inicial
          </label>
        </div>

        <div className="bento-card rounded-2xl p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="font-mono text-xs font-medium text-surface-700">
              Conteúdo Markdown
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="font-mono text-xs font-semibold text-accent-400 hover:text-accent-300 cursor-pointer"
            >
              {showPreview ? 'Editar Markdown' : 'Visualizar Preview'}
            </button>
          </div>
          {showPreview ? (
            <div className="h-[420px] overflow-y-auto rounded-xl border border-surface-200 bg-surface-50 p-6">
              <MarkdownRenderer content={form.content || '*Nenhum conteúdo ainda.*'} />
            </div>
          ) : (
            <Editor
              value={form.content}
              onChange={(value) => updateField('content', value)}
              placeholder="Escreva o conteúdo em Markdown com suporte a código e imagens..."
            />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
