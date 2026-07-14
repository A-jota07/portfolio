import { motion } from 'framer-motion'

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
  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  )
}
