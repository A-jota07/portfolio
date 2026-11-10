import React from 'react'
import { getTechIcon } from '@/utils/techIcons'

interface TechIconProps {
  name: string
  className?: string
}

export function TechIcon({ name }: TechIconProps): React.ReactNode {
  return getTechIcon(name)
}
