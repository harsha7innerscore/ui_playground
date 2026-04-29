import { memo } from 'react'
import type { LucideIcon } from 'lucide-react'

interface SettingItemProps {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
  'aria-describedby'?: string
}

export const SettingItem = memo(function SettingItem({
  icon: Icon,
  title,
  description,
  children,
  'aria-describedby': ariaDescribedBy
}: SettingItemProps) {
  const descriptionId = ariaDescribedBy || `setting-${title.toLowerCase().replace(/\s+/g, '-')}-desc`

  return (
    <div className="setting-item">
      <div className="setting-info">
        <div className="setting-title">
          <Icon size={20} aria-hidden="true" />
          {title}
        </div>
        <p className="setting-description" id={descriptionId}>
          {description}
        </p>
      </div>
      <div className="setting-control" aria-describedby={descriptionId}>
        {children}
      </div>
    </div>
  )
})

interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}

export const ToggleSwitch = memo(function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false
}: ToggleSwitchProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (!disabled) {
        onChange()
      }
    }
  }

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
      <span
        className="toggle-slider"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      />
    </label>
  )
})

interface SelectControlProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  label: string
  disabled?: boolean
}

export const SelectControl = memo(function SelectControl({
  value,
  onChange,
  options,
  label,
  disabled = false
}: SelectControlProps) {
  return (
    <select
      className="setting-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={label}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})