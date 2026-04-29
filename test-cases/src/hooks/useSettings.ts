import { useState, useCallback, useEffect } from 'react'

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  desktop: boolean
}

export interface PrivacySettings {
  profileVisibility: string
  activityStatus: boolean
  analyticsOptIn: boolean
}

export interface AllSettings {
  notifications: NotificationSettings
  privacy: PrivacySettings
}

const DEFAULT_SETTINGS: AllSettings = {
  notifications: {
    email: true,
    push: false,
    sms: true,
    desktop: true
  },
  privacy: {
    profileVisibility: 'public',
    activityStatus: true,
    analyticsOptIn: false
  }
}

const STORAGE_KEY = 'settings-dashboard-preferences'

function loadSettingsFromStorage(): AllSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load settings from storage:', error)
  }
  return DEFAULT_SETTINGS
}

function saveSettingsToStorage(settings: AllSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save settings to storage:', error)
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AllSettings>(loadSettingsFromStorage)

  const updateNotificationSetting = useCallback((key: keyof NotificationSettings) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: !prev.notifications[key]
        }
      }
      saveSettingsToStorage(updated)
      return updated
    })
  }, [])

  const updatePrivacySetting = useCallback((key: keyof PrivacySettings, value?: boolean | string) => {
    setSettings(prev => {
      const currentValue = prev.privacy[key]
      const newValue = value !== undefined
        ? value
        : typeof currentValue === 'boolean' ? !currentValue : currentValue

      const updated = {
        ...prev,
        privacy: {
          ...prev.privacy,
          [key]: newValue
        }
      }
      saveSettingsToStorage(updated)
      return updated
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    saveSettingsToStorage(DEFAULT_SETTINGS)
  }, [])

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      saveSettingsToStorage(settings)
    }
  }, [settings])

  return {
    settings,
    updateNotificationSetting,
    updatePrivacySetting,
    resetSettings
  }
}