import { memo, useMemo } from 'react'
import { GeneralSettings } from './GeneralSettings'
import { ProfileSettings } from './ProfileSettings'
import { NotificationSettings } from './NotificationSettings'
import { PrivacySettings } from './PrivacySettings'
import { DataSettings } from './DataSettings'
import type { SettingSection } from '../../constants/settings'

interface SettingsContentProps {
  activeSection: SettingSection
}

export const SettingsContent = memo(function SettingsContent({
  activeSection
}: SettingsContentProps) {
  const content = useMemo(() => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />
      case 'profile':
        return <ProfileSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'privacy':
        return <PrivacySettings />
      case 'data':
        return <DataSettings />
      default:
        return <GeneralSettings />
    }
  }, [activeSection])

  return (
    <div className="settings-main" role="main" aria-live="polite">
      {content}
    </div>
  )
})