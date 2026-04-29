import { memo } from 'react'
import { Card } from '../Card'
import { SettingItem, ToggleSwitch } from './SettingItem'
import { useSettings } from '../../hooks/useSettings'
import { ICONS } from '../../constants/settings'

export const NotificationSettings = memo(function NotificationSettings() {
  const { settings, updateNotificationSetting } = useSettings()

  return (
    <div className="settings-content">
      <h2>Notification Settings</h2>

      <Card className="settings-card">
        <SettingItem
          icon={ICONS.Mail}
          title="Email Notifications"
          description="Receive notifications via email"
        >
          <ToggleSwitch
            checked={settings.notifications.email}
            onChange={() => updateNotificationSetting('email')}
            label="Toggle email notifications"
          />
        </SettingItem>

        <SettingItem
          icon={ICONS.Smartphone}
          title="Push Notifications"
          description="Receive push notifications on your device"
        >
          <ToggleSwitch
            checked={settings.notifications.push}
            onChange={() => updateNotificationSetting('push')}
            label="Toggle push notifications"
          />
        </SettingItem>

        <SettingItem
          icon={ICONS.MessageSquare}
          title="SMS Notifications"
          description="Receive important updates via SMS"
        >
          <ToggleSwitch
            checked={settings.notifications.sms}
            onChange={() => updateNotificationSetting('sms')}
            label="Toggle SMS notifications"
          />
        </SettingItem>

        <SettingItem
          icon={ICONS.Monitor}
          title="Desktop Notifications"
          description="Show notifications on your desktop"
        >
          <ToggleSwitch
            checked={settings.notifications.desktop}
            onChange={() => updateNotificationSetting('desktop')}
            label="Toggle desktop notifications"
          />
        </SettingItem>
      </Card>
    </div>
  )
})