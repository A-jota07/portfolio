import { useEffect, useRef } from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  Separator,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  InsertCodeBlock,
  type MDXEditorMethods
} from '@mdxeditor/editor'

// Import library styles
import '@mdxeditor/editor/style.css'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Editor({ value, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null)

  // Avoid resetting editor value and losing cursor position during user typing
  useEffect(() => {
    if (editorRef.current) {
      const currentMarkdown = editorRef.current.getMarkdown()
      if (currentMarkdown !== value) {
        editorRef.current.setMarkdown(value)
      }
    }
  }, [value])

  return (
    <div className="w-full rounded-xl border border-surface-200 bg-white shadow-soft transition-all focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-400/30 overflow-hidden">
      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="markdown-body focus:outline-none min-h-[350px] p-6 font-sans text-surface-800"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler: async (file: File) => {
              // MOCK: URL temporária local para exibição imediata no editor
              const tempUrl = URL.createObjectURL(file)
              
              console.log('Upload de Imagem:', file.name, 'URL gerada:', tempUrl)
              
              /*
                ========================================================================
                [ATENÇÃO] - INTEGRAÇÃO COM API REAL
                ========================================================================
                Para salvar as imagens no seu banco de dados ou serviço de storage (S3, Cloudinary, etc.),
                comente a linha acima e implemente a chamada à sua API aqui. Exemplo:

                const formData = new FormData()
                formData.append('image', file)

                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    // Adicione cabeçalhos de autorização se necessário (JWT)
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                })

                if (!response.ok) throw new Error('Falha no upload da imagem')
                const data = await response.json()
                return data.url // URL pública da imagem salva
                ========================================================================
              */
              
              return tempUrl
            }
          }),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              ts: 'TypeScript',
              html: 'HTML',
              css: 'CSS',
              py: 'Python'
            }
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex items-center gap-1.5 flex-wrap p-2 border-b border-surface-200 bg-surface-50/50">
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <InsertImage />
                <Separator />
                <ConditionalContents
                  options={[
                    {
                      when: (editor) => editor?.editorType === 'codeblock',
                      contents: () => <ChangeCodeMirrorLanguage />
                    },
                    {
                      fallback: () => <InsertCodeBlock />
                    }
                  ]}
                />
              </div>
            )
          })
        ]}
      />
    </div>
  )
}
