import React from 'react'

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'textarea'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  'data-testid'?: string
}

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  rows = 3,
  'data-testid': testId
}: FormFieldProps) {
  const id = `form-field-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required-indicator" aria-label="required">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          data-testid={testId}
          className="form-input"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          data-testid={testId}
          className="form-input"
        />
      )}
    </div>
  )
}