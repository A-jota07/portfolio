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
  type MDXEditorMethods,
} from '@mdxeditor/editor'
import { uploadImageFile, resolveImageUrl } from '@/services/uploadService'

import '@mdxeditor/editor/style.css'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Editor({ value, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null)

  useEffect(() => {
    if (editorRef.current) {
      const currentMarkdown = editorRef.current.getMarkdown()
      if (currentMarkdown !== value) {
        editorRef.current.setMarkdown(value)
      }
    }
  }, [value])

  return (
    <div className="w-full overflow-hidden rounded-xl border border-surface-200 bg-surface-50 shadow-soft transition-all focus-within:border-accent-400">
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
              try {
                const response = await uploadImageFile(file)
                return resolveImageUrl(response.url)
              } catch (err) {
                console.error('Erro no upload de imagem via MDXEditor:', err)
                return URL.createObjectURL(file)
              }
            },
          }),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              ts: 'TypeScript',
              html: 'HTML',
              css: 'CSS',
              py: 'Python',
            },
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-200 bg-surface-100 p-2">
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
                      contents: () => <ChangeCodeMirrorLanguage />,
                    },
                    {
                      fallback: () => <InsertCodeBlock />,
                    },
                  ]}
                />
              </div>
            ),
          }),
        ]}
      />
    </div>
  )
}
