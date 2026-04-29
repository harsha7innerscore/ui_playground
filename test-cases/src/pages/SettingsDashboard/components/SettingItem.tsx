import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface SettingItemProps {
  icon: LucideIcon
  title: string
  description: string
  control: React.ReactNode
  className?: string
  'data-testid'?: string
}

export function SettingItem({
  icon: Icon,
  title,
  description,
  control,
  className = '',
  'data-testid': testId
}: SettingItemProps) {
  return (
    <div className={`setting-item ${className}`} data-testid={testId}>
      <div className="setting-info">
        <div className="setting-title">
          <Icon size={20} aria-hidden="true" />
          {title}
        </div>
        <p className="setting-description" id={`${testId}-description`}>
          {description}
        </p>
      </div>
      <div className="setting-control">
        {control}
      </div>
    </div>
  )
}