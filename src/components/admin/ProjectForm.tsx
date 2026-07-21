import { useState } from 'react'
import type { ProjectInput } from '@/types/project'
import { Button } from '@/components/ui/Button'
import { MarkdownRenderer } from '@/components/portfolio/MarkdownRenderer'
import { Editor } from './Editor'
import { TagSelect } from './TagSelect'
import { ImageUploadInput } from './ImageUploadInput'

interface ProjectFormProps {
  initialData?: Partial<ProjectInput>
  onSubmit: (data: ProjectInput) => void
  submitLabel?: string
}

const emptyForm: ProjectInput = {
  title: '',
  summary: '',
  coverImage: '',
  tags: [],
  content: '',
  featured: false,
}

export function ProjectForm({
  initialData,
  onSubmit,
  submitLabel = 'Salvar Projeto',
}: ProjectFormProps) {
  const [form, setForm] = useState<ProjectInput>({ ...emptyForm, ...initialData })
  const [showPreview, setShowPreview] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.coverImage) {
      setFormError('Por favor, faça o upload de uma imagem de capa ou informe uma URL externa.')
      return
    }

    onSubmit(form)
  }

  const updateField = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">Título</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent-400/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">Resumo</label>
            <textarea
              required
              rows={3}
              value={form.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent-400/40"
            />
          </div>

          {/* Componente flexível de imagem de capa: Upload vs URL */}
          <ImageUploadInput
            value={form.coverImage}
            onChange={(url) => updateField('coverImage', url)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">
              Linguagens e Tecnologias
            </label>
            <TagSelect
              selectedTags={form.tags}
              onChange={(tags) => updateField('tags', tags)}
              placeholder="Buscar ou adicionar tecnologias (ex: React, TypeScript, D3.js)..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-surface-600">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="rounded border-surface-300"
            />
            Projeto em destaque
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">Conteúdo Markdown</label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-medium text-accent-600 hover:text-accent-500"
            >
              {showPreview ? 'Editar' : 'Preview'}
            </button>
          </div>
          {showPreview ? (
            <div className="h-[420px] overflow-y-auto rounded-xl border border-surface-200 bg-white p-6">
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
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
