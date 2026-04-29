import { useState, useCallback } from 'react'
import type { SettingSection } from '../constants/settings'

export function useSettingsNavigation(defaultSection: SettingSection = 'general') {
  const [activeSection, setActiveSection] = useState<SettingSection>(defaultSection)

  const navigateToSection = useCallback((section: SettingSection) => {
    setActiveSection(section)
  }, [])

  return {
    activeSection,
    navigateToSection
  }
}