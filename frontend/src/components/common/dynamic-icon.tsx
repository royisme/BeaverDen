// components/common/dynamic-icon.tsx
import React from 'react'
import * as Icons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

interface DynamicIconProps {
    name: string
    className?: string
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className }) => {
  // Get the corresponding icon component
  const Icon = Icons[name as keyof typeof Icons] as React.FC<LucideProps>

  // If Icon is not a valid component, fallback to HelpCircle
  if (!Icon) {
    const FallbackIcon = Icons.HelpCircle
    return <FallbackIcon className={className} />
  }

  return <Icon className={className} />
}