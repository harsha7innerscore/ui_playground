import { memo } from 'react'
import { Card } from '../Card'
import { SETTING_SECTIONS } from '../../constants/settings'
import type { SettingSection } from '../../constants/settings'

interface SettingsNavigationProps {
  activeSection: SettingSection
  onSectionChange: (section: SettingSection) => void
}

export const SettingsNavigation = memo(function SettingsNavigation({
  activeSection,
  onSectionChange
}: SettingsNavigationProps) {
  return (
    <Card className="settings-nav">
      <nav className="settings-nav-list" role="navigation" aria-label="Settings sections">
        {SETTING_SECTIONS.map(section => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              className={`settings-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Navigate to ${section.name} settings`}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{section.name}</span>
            </button>
          )
        })}
      </nav>
    </Card>
  )
})