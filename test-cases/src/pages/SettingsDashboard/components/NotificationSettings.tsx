import { memo } from 'react'
import { Mail, Smartphone, MessageSquare, Monitor } from 'lucide-react'
import { Card } from '../../../components/Card'
import { SettingItem } from './SettingItem'
import { ToggleSwitch } from './ToggleSwitch'
import type { NotificationSettings as NotificationSettingsType, NotificationKey } from '../types'

interface NotificationSettingsProps {
  notifications: NotificationSettingsType
  onToggleNotification: (type: NotificationKey) => void
}

export const NotificationSettings = memo(function NotificationSettings({
  notifications,
  onToggleNotification
}: NotificationSettingsProps) {
  return (
    <div className="settings-content">
      <h2>Notification Settings</h2>

      <Card className="settings-card">
        <SettingItem
          icon={Mail}
          title="Email Notifications"
          description="Receive notifications via email"
          data-testid="email-notification-setting"
          control={
            <ToggleSwitch
              checked={notifications.email}
              onChange={() => onToggleNotification('email')}
              ariaLabel="Toggle email notifications"
              id="email-notifications"
            />
          }
        />

        <SettingItem
          icon={Smartphone}
          title="Push Notifications"
          description="Receive push notifications on your device"
          data-testid="push-notification-setting"
          control={
            <ToggleSwitch
              checked={notifications.push}
              onChange={() => onToggleNotification('push')}
              ariaLabel="Toggle push notifications"
              id="push-notifications"
            />
          }
        />

        <SettingItem
          icon={MessageSquare}
          title="SMS Notifications"
          description="Receive important updates via SMS"
          data-testid="sms-notification-setting"
          control={
            <ToggleSwitch
              checked={notifications.sms}
              onChange={() => onToggleNotification('sms')}
              ariaLabel="Toggle SMS notifications"
              id="sms-notifications"
            />
          }
        />

        <SettingItem
          icon={Monitor}
          title="Desktop Notifications"
          description="Show notifications on your desktop"
          data-testid="desktop-notification-setting"
          control={
            <ToggleSwitch
              checked={notifications.desktop}
              onChange={() => onToggleNotification('desktop')}
              ariaLabel="Toggle desktop notifications"
              id="desktop-notifications"
            />
          }
        />
      </Card>
    </div>
  )
})