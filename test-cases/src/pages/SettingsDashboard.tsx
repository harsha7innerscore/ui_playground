import { useState } from 'react'
import { Card } from '../components/Card'
import { useTheme } from '../contexts/ThemeContext'
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Monitor,
  Sun,
  Moon,
  Smartphone,
  Mail,
  MessageSquare,
  Lock,
  Eye,
  Database,
  Download,
  Trash2
} from 'lucide-react'
import './Dashboard.css'

export function SettingsDashboard() {
  const { isDark, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('general')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    desktop: true
  })
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    activityStatus: true,
    analyticsOptIn: false
  })

  const sections = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'data', name: 'Data Management', icon: Database }
  ]

  const handleNotificationToggle = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handlePrivacyToggle = (type: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: typeof prev[type] === 'boolean' ? !prev[type] : prev[type]
    }))
  }

  const renderGeneralSettings = () => (
    <div className="settings-content">
      <h2>General Settings</h2>

      <Card className="settings-card">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Globe size={20} />
              Language
            </div>
            <p className="setting-description">Choose your preferred language</p>
          </div>
          <select className="setting-control">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
              Theme
            </div>
            <p className="setting-description">Choose your preferred theme</p>
          </div>
          <button
            className="setting-control theme-toggle-btn"
            onClick={toggleTheme}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Monitor size={20} />
              Dashboard Layout
            </div>
            <p className="setting-description">Customize your dashboard layout</p>
          </div>
          <select className="setting-control">
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="expanded">Expanded</option>
          </select>
        </div>
      </Card>
    </div>
  )

  const renderProfileSettings = () => (
    <div className="settings-content">
      <h2>Profile Settings</h2>

      <Card className="settings-card">
        <div className="profile-section">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <User size={40} />
            </div>
            <button className="btn-secondary">Change Photo</button>
          </div>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" defaultValue="John" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" defaultValue="Doe" />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" defaultValue="john.doe@company.com" />
            </div>

            <div className="form-group">
              <label>Job Title</label>
              <input type="text" defaultValue="Senior Developer" />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                rows={3}
                defaultValue="Passionate developer with 5+ years of experience in building modern web applications."
              />
            </div>

            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="settings-content">
      <h2>Notification Settings</h2>

      <Card className="settings-card">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Mail size={20} />
              Email Notifications
            </div>
            <p className="setting-description">Receive notifications via email</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() => handleNotificationToggle('email')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Smartphone size={20} />
              Push Notifications
            </div>
            <p className="setting-description">Receive push notifications on your device</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={() => handleNotificationToggle('push')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <MessageSquare size={20} />
              SMS Notifications
            </div>
            <p className="setting-description">Receive important updates via SMS</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={() => handleNotificationToggle('sms')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Monitor size={20} />
              Desktop Notifications
            </div>
            <p className="setting-description">Show notifications on your desktop</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.desktop}
              onChange={() => handleNotificationToggle('desktop')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </Card>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="settings-content">
      <h2>Privacy & Security</h2>

      <Card className="settings-card">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Eye size={20} />
              Profile Visibility
            </div>
            <p className="setting-description">Control who can see your profile</p>
          </div>
          <select
            className="setting-control"
            value={privacy.profileVisibility}
            onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
          >
            <option value="public">Public</option>
            <option value="team">Team Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <User size={20} />
              Activity Status
            </div>
            <p className="setting-description">Show when you're online</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacy.activityStatus}
              onChange={() => handlePrivacyToggle('activityStatus')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Lock size={20} />
              Two-Factor Authentication
            </div>
            <p className="setting-description">Add extra security to your account</p>
          </div>
          <button className="btn-secondary">Enable 2FA</button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">
              <Database size={20} />
              Analytics Opt-in
            </div>
            <p className="setting-description">Help improve our service with anonymous usage data</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacy.analyticsOptIn}
              onChange={() => handlePrivacyToggle('analyticsOptIn')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </Card>
    </div>
  )

  const renderDataManagement = () => (
    <div className="settings-content">
      <h2>Data Management</h2>

      <Card className="settings-card">
        <div className="data-action">
          <div className="data-info">
            <div className="data-title">
              <Download size={20} />
              Export Data
            </div>
            <p className="data-description">Download a copy of your data</p>
          </div>
          <button className="btn-secondary">Export</button>
        </div>

        <div className="data-action">
          <div className="data-info">
            <div className="data-title">
              <Database size={20} />
              Data Usage
            </div>
            <p className="data-description">See how much storage you're using</p>
          </div>
          <div className="data-usage">
            <div className="usage-bar">
              <div className="usage-fill" style={{ width: '45%' }}></div>
            </div>
            <span className="usage-text">4.5 GB of 10 GB used</span>
          </div>
        </div>

        <div className="data-action danger">
          <div className="data-info">
            <div className="data-title">
              <Trash2 size={20} />
              Delete Account
            </div>
            <p className="data-description">Permanently delete your account and all data</p>
          </div>
          <button className="btn-danger">Delete Account</button>
        </div>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'profile':
        return renderProfileSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'privacy':
        return renderPrivacySettings()
      case 'data':
        return renderDataManagement()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Settings</h1>
          <p className="dashboard-subtitle">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation */}
        <Card className="settings-nav">
          <nav className="settings-nav-list">
            {sections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={20} />
                  <span>{section.name}</span>
                </button>
              )
            })}
          </nav>
        </Card>

        {/* Settings Content */}
        <div className="settings-main">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}