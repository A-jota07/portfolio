import { motion, useReducedMotion } from 'framer-motion'
import { resolveImageUrl } from '@/services/uploadService'

interface HoverZoomImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
}

export function HoverZoomImage({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[16/10]',
}: HoverZoomImageProps) {
  const resolvedSrc = resolveImageUrl(src)
  const prefersReducedMotion = Boolean(useReducedMotion())

  return (
    <div className={`relative overflow-hidden bg-surface-100 ${aspectRatio} ${className}`}>
      <motion.img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-50/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  )
}
