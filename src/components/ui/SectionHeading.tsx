import { motion, useReducedMotion } from 'framer-motion'

interface SectionHeadingProps {
  eyebrow?: string
  codeComment?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  codeComment,
  title,
  subtitle,
  align = 'left',
}: SectionHeadingProps) {
  const prefersReducedMotion = useReducedMotion()
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-12 max-w-2xl ${alignClass}`}
    >
      <div
        className={`mb-3 inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-100/80 px-3 py-1 font-mono text-xs font-medium text-accent-400 ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      >
        <span className="text-surface-400">//</span>
        <span>{codeComment || eyebrow?.toLowerCase().replace(/\s+/g, '_') || 'secao'}</span>
      </div>
      <h2 className="font-display text-fluid-h2 font-bold tracking-tight text-surface-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-surface-500 md:text-lg">{subtitle}</p>
      )}
    </motion.div>
  )
}
