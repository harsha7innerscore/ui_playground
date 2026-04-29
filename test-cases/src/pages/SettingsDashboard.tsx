import { memo } from 'react'
import { useSettingsNavigation } from '../hooks/useSettingsNavigation'
import { SettingsNavigation, SettingsContent } from '../components/settings'
import './Dashboard.css'

export const SettingsDashboard = memo(function SettingsDashboard() {
  const { activeSection, navigateToSection } = useSettingsNavigation('general')

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Settings</h1>
          <p className="dashboard-subtitle">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <SettingsNavigation
          activeSection={activeSection}
          onSectionChange={navigateToSection}
        />
        <SettingsContent activeSection={activeSection} />
      </div>
    </div>
  )
})