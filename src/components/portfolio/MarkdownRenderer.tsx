import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { slugifyHeading } from '@/utils/slugify'

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
    a: ({ href, children, ...props }) => {
      if (!href || href.trim().toLowerCase().startsWith('javascript:')) {
        return <span {...props}>{children}</span>
      }
      const isExternal = href.startsWith('http://') || href.startsWith('https://')
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
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
