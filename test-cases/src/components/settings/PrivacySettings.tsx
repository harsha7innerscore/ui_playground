import { memo } from 'react'
import { Card } from '../Card'
import { SettingItem, ToggleSwitch, SelectControl } from './SettingItem'
import { useSettings } from '../../hooks/useSettings'
import { ICONS, PRIVACY_VISIBILITY_OPTIONS } from '../../constants/settings'

export const PrivacySettings = memo(function PrivacySettings() {
  const { settings, updatePrivacySetting } = useSettings()

  return (
    <div className="settings-content">
      <h2>Privacy & Security</h2>

      <Card className="settings-card">
        <SettingItem
          icon={ICONS.Eye}
          title="Profile Visibility"
          description="Control who can see your profile"
        >
          <SelectControl
            value={settings.privacy.profileVisibility}
            onChange={(value) => updatePrivacySetting('profileVisibility', value)}
            options={PRIVACY_VISIBILITY_OPTIONS}
            label="Select profile visibility"
          />
        </SettingItem>

        <SettingItem
          icon={ICONS.User}
          title="Activity Status"
          description="Show when you're online"
        >
          <ToggleSwitch
            checked={settings.privacy.activityStatus}
            onChange={() => updatePrivacySetting('activityStatus')}
            label="Toggle activity status visibility"
          />
        </SettingItem>

        <SettingItem
          icon={ICONS.Lock}
          title="Two-Factor Authentication"
          description="Add extra security to your account"
        >
          <button
            className="btn-secondary"
            aria-label="Enable two-factor authentication"
          >
            Enable 2FA
          </button>
        </SettingItem>

        <SettingItem
          icon={ICONS.Database}
          title="Analytics Opt-in"
          description="Help improve our service with anonymous usage data"
        >
          <ToggleSwitch
            checked={settings.privacy.analyticsOptIn}
            onChange={() => updatePrivacySetting('analyticsOptIn')}
            label="Toggle analytics data sharing"
          />
        </SettingItem>
      </Card>
    </div>
  )
})