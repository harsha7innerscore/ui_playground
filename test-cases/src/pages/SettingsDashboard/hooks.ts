import { useState, useCallback } from 'react'
import type { NotificationSettings, PrivacySettings, ProfileFormData, NotificationKey, PrivacyKey } from './types'
import { SettingsSection } from './types'
import { DEFAULT_NOTIFICATIONS, DEFAULT_PRIVACY, DEFAULT_PROFILE } from './constants'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS)

  const toggleNotification = useCallback((type: NotificationKey) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }, [])

  const updateNotifications = useCallback((newSettings: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...newSettings }))
  }, [])

  return {
    notifications,
    toggleNotification,
    updateNotifications
  }
}

export const usePrivacySettings = () => {
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY)

  const togglePrivacySetting = useCallback((type: PrivacyKey) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: typeof prev[type] === 'boolean' ? !prev[type] : prev[type]
    }))
  }, [])

  const updatePrivacySetting = useCallback((key: PrivacyKey, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  return {
    privacy,
    togglePrivacySetting,
    updatePrivacySetting
  }
}

export const useProfileForm = () => {
  const [profile, setProfile] = useState<ProfileFormData>(DEFAULT_PROFILE)
  const [isEdited, setIsEdited] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateProfile = useCallback((field: keyof ProfileFormData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
    setIsEdited(true)
  }, [])

  const saveProfile = useCallback(async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEdited(false)
      return true
    } catch (error) {
      console.error('Failed to save profile:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE)
    setIsEdited(false)
  }, [])

  return {
    profile,
    isEdited,
    isSaving,
    updateProfile,
    saveProfile,
    resetProfile
  }
}

export const useActiveSection = (defaultSection: SettingsSection = SettingsSection.GENERAL) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(defaultSection)

  const changeSection = useCallback((section: SettingsSection) => {
    setActiveSection(section)
  }, [])

  return {
    activeSection,
    changeSection
  }
}