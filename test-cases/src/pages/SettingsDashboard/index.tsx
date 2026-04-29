import { useMemo } from 'react'
import { Card } from '../../components/Card'
import { useTheme } from '../../contexts/ThemeContext'
import {
  useNotifications,
  usePrivacySettings,
  useProfileForm,
  useActiveSection
} from './hooks'
import {
  GeneralSettings,
  ProfileSettings,
  NotificationSettings,
  PrivacySettings,
  DataManagement
} from './components'
import { SETTINGS_SECTIONS } from './constants'
import { SettingsSection } from './types'
import '../Dashboard.css'

export function SettingsDashboard() {
  const { isDark, toggleTheme } = useTheme()
  const { activeSection, changeSection } = useActiveSection()
  const { notifications, toggleNotification } = useNotifications()
  const { privacy, togglePrivacySetting, updatePrivacySetting } = usePrivacySettings()
  const { profile, isEdited, isSaving, updateProfile, saveProfile } = useProfileForm()

  const renderContent = useMemo(() => {
    switch (activeSection) {
      case SettingsSection.GENERAL:
        return (
          <GeneralSettings
            isDark={isDark}
            onThemeToggle={toggleTheme}
          />
        )
      case SettingsSection.PROFILE:
        return (
          <ProfileSettings
            profile={profile}
            onUpdateProfile={updateProfile}
            onSaveProfile={saveProfile}
            isEdited={isEdited}
            isSaving={isSaving}
          />
        )
      case SettingsSection.NOTIFICATIONS:
        return (
          <NotificationSettings
            notifications={notifications}
            onToggleNotification={toggleNotification}
          />
        )
      case SettingsSection.PRIVACY:
        return (
          <PrivacySettings
            privacy={privacy}
            onTogglePrivacySetting={togglePrivacySetting}
            onUpdatePrivacySetting={updatePrivacySetting}
          />
        )
      case SettingsSection.DATA:
        return <DataManagement />
      default:
        return (
          <GeneralSettings
            isDark={isDark}
            onThemeToggle={toggleTheme}
          />
        )
    }
  }, [
    activeSection,
    isDark,
    toggleTheme,
    profile,
    updateProfile,
    saveProfile,
    isEdited,
    isSaving,
    notifications,
    toggleNotification,
    privacy,
    togglePrivacySetting,
    updatePrivacySetting
  ])

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
        {/* Settings Navigation */}
        <Card className="settings-nav">
          <nav className="settings-nav-list" role="navigation" aria-label="Settings navigation">
            {SETTINGS_SECTIONS.map(section => {
              const Icon = section.icon
              const isActive = activeSection === section.id

              return (
                <button
                  key={section.id}
                  className={`settings-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => changeSection(section.id)}
                  aria-current={isActive ? 'page' : undefined}
                  data-testid={`settings-nav-${section.id}`}
                  aria-label={`Switch to ${section.name} settings`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{section.name}</span>
                </button>
              )
            })}
          </nav>
        </Card>

        {/* Settings Content */}
        <main className="settings-main" role="main" aria-live="polite">
          {renderContent}
        </main>
      </div>
    </div>
  )
}