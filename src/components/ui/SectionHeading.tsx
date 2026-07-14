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
    <div className={`mb-12 max-w-2xl ${alignClass}`}>
      {eyebrow && (
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-surface-900 md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg leading-relaxed text-surface-500">{subtitle}</p>
      )}
    </div>
  )
}
