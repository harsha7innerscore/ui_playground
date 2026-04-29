import { memo } from 'react'
import { Eye, User, Lock, Database } from 'lucide-react'
import { Card } from '../../../components/Card'
import { SettingItem } from './SettingItem'
import { ToggleSwitch } from './ToggleSwitch'
import type { PrivacySettings as PrivacySettingsType, PrivacyKey } from '../types'
import { PROFILE_VISIBILITY_OPTIONS } from '../constants'

interface PrivacySettingsProps {
  privacy: PrivacySettingsType
  onTogglePrivacySetting: (type: PrivacyKey) => void
  onUpdatePrivacySetting: (key: PrivacyKey, value: any) => void
}

export const PrivacySettings = memo(function PrivacySettings({
  privacy,
  onTogglePrivacySetting,
  onUpdatePrivacySetting
}: PrivacySettingsProps) {
  return (
    <div className="settings-content">
      <h2>Privacy & Security</h2>

      <Card className="settings-card">
        <SettingItem
          icon={Eye}
          title="Profile Visibility"
          description="Control who can see your profile"
          data-testid="profile-visibility-setting"
          control={
            <select
              className="setting-control"
              value={privacy.profileVisibility}
              onChange={(e) => onUpdatePrivacySetting('profileVisibility', e.target.value)}
              aria-label="Select profile visibility"
              data-testid="profile-visibility-select"
            >
              {PROFILE_VISIBILITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />

        <SettingItem
          icon={User}
          title="Activity Status"
          description="Show when you're online"
          data-testid="activity-status-setting"
          control={
            <ToggleSwitch
              checked={privacy.activityStatus}
              onChange={() => onTogglePrivacySetting('activityStatus')}
              ariaLabel="Toggle activity status visibility"
              id="activity-status"
            />
          }
        />

        <SettingItem
          icon={Lock}
          title="Two-Factor Authentication"
          description="Add extra security to your account"
          data-testid="two-factor-setting"
          control={
            <button
              className="btn-secondary"
              aria-label="Enable two-factor authentication"
              data-testid="enable-2fa-btn"
            >
              Enable 2FA
            </button>
          }
        />

        <SettingItem
          icon={Database}
          title="Analytics Opt-in"
          description="Help improve our service with anonymous usage data"
          data-testid="analytics-setting"
          control={
            <ToggleSwitch
              checked={privacy.analyticsOptIn}
              onChange={() => onTogglePrivacySetting('analyticsOptIn')}
              ariaLabel="Toggle analytics data collection"
              id="analytics-opt-in"
            />
          }
        />
      </Card>
    </div>
  )
})