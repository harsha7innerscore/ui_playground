import { memo } from 'react'
import { Card } from '../Card'
import { ICONS, DEFAULT_PROFILE_VALUES } from '../../constants/settings'

export const ProfileSettings = memo(function ProfileSettings() {
  return (
    <div className="settings-content">
      <h2>Profile Settings</h2>

      <Card className="settings-card">
        <div className="profile-section">
          <div className="profile-avatar-section">
            <div className="profile-avatar" role="img" aria-label="Profile picture">
              <ICONS.User size={40} />
            </div>
            <button className="btn-secondary" aria-label="Change profile photo">
              Change Photo
            </button>
          </div>

          <div className="profile-form" role="form" aria-label="Profile information">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  defaultValue={DEFAULT_PROFILE_VALUES.firstName}
                  aria-label="First name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  defaultValue={DEFAULT_PROFILE_VALUES.lastName}
                  aria-label="Last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                defaultValue={DEFAULT_PROFILE_VALUES.email}
                aria-label="Email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobTitle">Job Title</label>
              <input
                id="jobTitle"
                type="text"
                defaultValue={DEFAULT_PROFILE_VALUES.jobTitle}
                aria-label="Job title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                rows={3}
                defaultValue={DEFAULT_PROFILE_VALUES.bio}
                aria-label="Biography"
              />
            </div>

            <button className="btn-primary" type="button">
              Save Changes
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
})