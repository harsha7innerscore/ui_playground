import { memo } from 'react'
import { Card } from '../Card'
import { SettingItem, SelectControl } from './SettingItem'
import { useTheme } from '../../contexts/ThemeContext'
import { ICONS, LANGUAGE_OPTIONS, LAYOUT_OPTIONS } from '../../constants/settings'

export const GeneralSettings = memo(function GeneralSettings() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="settings-content">
      <h2>General Settings</h2>

      <Card className="settings-card">
        <SettingItem
          icon={ICONS.Globe}
          title="Language"
          description="Choose your preferred language"
        >
          <SelectControl
            value="en"
            onChange={() => {}} // TODO: Implement language switching
            options={LANGUAGE_OPTIONS}
            label="Select language"
          />
        </SettingItem>

        <SettingItem
          icon={isDark ? ICONS.Moon : ICONS.Sun}
          title="Theme"
          description="Choose your preferred theme"
        >
          <button
            className="setting-control theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </SettingItem>

        <SettingItem
          icon={ICONS.Monitor}
          title="Dashboard Layout"
          description="Customize your dashboard layout"
        >
          <SelectControl
            value="default"
            onChange={() => {}} // TODO: Implement layout switching
            options={LAYOUT_OPTIONS}
            label="Select dashboard layout"
          />
        </SettingItem>
      </Card>
    </div>
  )
})