
interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  ariaLabel?: string
  id?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  id
}: ToggleSwitchProps) {
  return (
    <label className="toggle-switch" aria-label={ariaLabel}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-describedby={ariaLabel ? `${id}-description` : undefined}
      />
      <span className="toggle-slider"></span>
    </label>
  )
}