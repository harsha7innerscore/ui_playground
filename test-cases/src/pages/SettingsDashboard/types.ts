export const SettingsSection = {
  GENERAL: 'general',
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  PRIVACY: 'privacy',
  DATA: 'data'
} as const

export type SettingsSection = typeof SettingsSection[keyof typeof SettingsSection]

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  desktop: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private'
  activityStatus: boolean
  analyticsOptIn: boolean
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  bio: string
}

export interface SettingsNavItem {
  id: SettingsSection
  name: string
  icon: React.ComponentType<{ size?: number }>
}

export type NotificationKey = keyof NotificationSettings
export type PrivacyKey = keyof PrivacySettings

export interface DataUsage {
  used: number
  total: number
  percentage: number
}