import {
  Settings,
  User,
  Bell,
  Shield,
  Database
} from 'lucide-react'
import type { NotificationSettings, PrivacySettings, ProfileFormData, SettingsNavItem, DataUsage } from './types'
import { SettingsSection } from './types'

export const SETTINGS_SECTIONS: SettingsNavItem[] = [
  { id: SettingsSection.GENERAL, name: 'General', icon: Settings },
  { id: SettingsSection.PROFILE, name: 'Profile', icon: User },
  { id: SettingsSection.NOTIFICATIONS, name: 'Notifications', icon: Bell },
  { id: SettingsSection.PRIVACY, name: 'Privacy & Security', icon: Shield },
  { id: SettingsSection.DATA, name: 'Data Management', icon: Database }
]

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  email: true,
  push: false,
  sms: true,
  desktop: true
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: 'public',
  activityStatus: true,
  analyticsOptIn: false
}

export const DEFAULT_PROFILE: ProfileFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  jobTitle: 'Senior Developer',
  bio: 'Passionate developer with 5+ years of experience in building modern web applications.'
}

export const DEFAULT_DATA_USAGE: DataUsage = {
  used: 4.5,
  total: 10,
  percentage: 45
}

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' }
]

export const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'expanded', label: 'Expanded' }
]

export const PROFILE_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'team', label: 'Team Only' },
  { value: 'private', label: 'Private' }
]