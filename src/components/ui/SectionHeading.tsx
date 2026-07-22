import { motion } from 'framer-motion'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`mb-12 max-w-2xl ${alignClass}`}
    >
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full bg-surface-900 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-sm">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-surface-900 md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg leading-relaxed text-surface-500">{subtitle}</p>
      )}
    </motion.div>
  )
}
