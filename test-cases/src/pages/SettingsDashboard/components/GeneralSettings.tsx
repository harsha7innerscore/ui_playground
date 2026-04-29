import { memo } from 'react'
import { Globe, Monitor, Sun, Moon } from 'lucide-react'
import { Card } from '../../../components/Card'
import { SettingItem } from './SettingItem'
import { LANGUAGE_OPTIONS, LAYOUT_OPTIONS } from '../constants'

interface GeneralSettingsProps {
  isDark: boolean
  onThemeToggle: () => void
}

export const GeneralSettings = memo(function GeneralSettings({
  isDark,
  onThemeToggle
}: GeneralSettingsProps) {
  return (
    <div className="settings-content">
      <h2>General Settings</h2>

      <Card className="settings-card">
        <SettingItem
          icon={Globe}
          title="Language"
          description="Choose your preferred language"
          data-testid="language-setting"
          control={
            <select
              className="setting-control"
              aria-label="Select language"
              data-testid="language-select"
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />

        <SettingItem
          icon={isDark ? Moon : Sun}
          title="Theme"
          description="Choose your preferred theme"
          data-testid="theme-setting"
          control={
            <button
              className="setting-control theme-toggle-btn"
              onClick={onThemeToggle}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              data-testid="theme-toggle"
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          }
        />

        <SettingItem
          icon={Monitor}
          title="Dashboard Layout"
          description="Customize your dashboard layout"
          data-testid="layout-setting"
          control={
            <select
              className="setting-control"
              aria-label="Select dashboard layout"
              data-testid="layout-select"
            >
              {LAYOUT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />
      </Card>
    </div>
  )
})