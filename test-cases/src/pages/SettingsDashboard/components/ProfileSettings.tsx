import { memo } from 'react'
import { User } from 'lucide-react'
import { Card } from '../../../components/Card'
import { FormField } from './FormField'
import type { ProfileFormData } from '../types'

interface ProfileSettingsProps {
  profile: ProfileFormData
  onUpdateProfile: (field: keyof ProfileFormData, value: string) => void
  onSaveProfile: () => Promise<boolean>
  isEdited: boolean
  isSaving: boolean
}

export const ProfileSettings = memo(function ProfileSettings({
  profile,
  onUpdateProfile,
  onSaveProfile,
  isEdited,
  isSaving
}: ProfileSettingsProps) {
  const handleSave = async () => {
    const success = await onSaveProfile()
    // Could add toast notification here
    console.log(success ? 'Profile saved successfully' : 'Failed to save profile')
  }

  return (
    <div className="settings-content">
      <h2>Profile Settings</h2>

      <Card className="settings-card">
        <div className="profile-section">
          <div className="profile-avatar-section">
            <div className="profile-avatar" role="img" aria-label="Profile picture">
              <User size={40} />
            </div>
            <button
              className="btn-secondary"
              aria-label="Change profile photo"
              data-testid="change-photo-btn"
            >
              Change Photo
            </button>
          </div>

          <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="form-row">
              <FormField
                label="First Name"
                value={profile.firstName}
                onChange={(value) => onUpdateProfile('firstName', value)}
                data-testid="first-name-input"
                required
              />
              <FormField
                label="Last Name"
                value={profile.lastName}
                onChange={(value) => onUpdateProfile('lastName', value)}
                data-testid="last-name-input"
                required
              />
            </div>

            <FormField
              label="Email"
              type="email"
              value={profile.email}
              onChange={(value) => onUpdateProfile('email', value)}
              data-testid="email-input"
              required
            />

            <FormField
              label="Job Title"
              value={profile.jobTitle}
              onChange={(value) => onUpdateProfile('jobTitle', value)}
              data-testid="job-title-input"
            />

            <FormField
              label="Bio"
              type="textarea"
              value={profile.bio}
              onChange={(value) => onUpdateProfile('bio', value)}
              data-testid="bio-input"
              rows={3}
            />

            <button
              type="submit"
              className={`btn-primary ${!isEdited ? 'disabled' : ''}`}
              disabled={!isEdited || isSaving}
              data-testid="save-profile-btn"
              aria-label={isSaving ? 'Saving profile...' : 'Save profile changes'}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
})