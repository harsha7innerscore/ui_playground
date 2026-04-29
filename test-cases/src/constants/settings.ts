import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Sun,
  Moon,
  Monitor,
  Mail,
  Smartphone,
  MessageSquare,
  Eye,
  Lock,
  Download,
  Trash2
} from 'lucide-react'

export type SettingSection = 'general' | 'profile' | 'notifications' | 'privacy' | 'data'

export interface SettingSectionConfig {
  id: SettingSection
  name: string
  icon: typeof Settings
}

export const SETTING_SECTIONS: SettingSectionConfig[] = [
  { id: 'general', name: 'General', icon: Settings },
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  { id: 'data', name: 'Data Management', icon: Database }
]

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

export const PRIVACY_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'team', label: 'Team Only' },
  { value: 'private', label: 'Private' }
]

export const DEFAULT_PROFILE_VALUES = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  jobTitle: 'Senior Developer',
  bio: 'Passionate developer with 5+ years of experience in building modern web applications.'
}

export const ICONS = {
  Globe,
  Sun,
  Moon,
  Monitor,
  Mail,
  Smartphone,
  MessageSquare,
  Eye,
  User,
  Lock,
  Database,
  Download,
  Trash2
} as const