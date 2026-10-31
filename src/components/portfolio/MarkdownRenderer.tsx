import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const props = (children as { props?: { children?: React.ReactNode } }).props
    return extractTextFromChildren(props?.children)
  }
  return ''
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const components: Components = {
    h1: ({ children, ...props }) => {
      const id = slugifyHeading(extractTextFromChildren(children))
      return (
        <h1 id={id} {...props}>
          {children}
        </h1>
      )
    },
    h2: ({ children, ...props }) => {
      const id = slugifyHeading(extractTextFromChildren(children))
      return (
        <h2 id={id} {...props}>
          {children}
        </h2>
      )
    },
    h3: ({ children, ...props }) => {
      const id = slugifyHeading(extractTextFromChildren(children))
      return (
        <h3 id={id} {...props}>
          {children}
        </h3>
      )
    },
  }

  return (
    <article className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
