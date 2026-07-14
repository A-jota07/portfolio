import { useState } from 'react'
import type { ProjectInput } from '@/types/project'
import { Button } from '@/components/ui/Button'
import { MarkdownRenderer } from '@/components/portfolio/MarkdownRenderer'

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
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(', '))
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
  }

  const updateField = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">
              URL da Imagem de Capa
            </label>
            <input
              type="url"
              required
              value={form.coverImage}
              onChange={(e) => updateField('coverImage', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent-400/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="React, TypeScript, Tailwind"
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent-400/40"
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
            <textarea
              required
              rows={18}
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="## Título do Projeto&#10;&#10;Descreva o projeto em Markdown..."
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 font-mono text-sm leading-relaxed outline-none transition-shadow focus:ring-2 focus:ring-accent-400/40"
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
