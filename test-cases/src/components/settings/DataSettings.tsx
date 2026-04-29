import { memo } from 'react'
import { Card } from '../Card'
import { ICONS } from '../../constants/settings'

export const DataSettings = memo(function DataSettings() {
  return (
    <div className="settings-content">
      <h2>Data Management</h2>

      <Card className="settings-card">
        <div className="data-action">
          <div className="data-info">
            <div className="data-title">
              <ICONS.Download size={20} aria-hidden="true" />
              Export Data
            </div>
            <p className="data-description">Download a copy of your data</p>
          </div>
          <button
            className="btn-secondary"
            aria-label="Export your data"
          >
            Export
          </button>
        </div>

        <div className="data-action">
          <div className="data-info">
            <div className="data-title">
              <ICONS.Database size={20} aria-hidden="true" />
              Data Usage
            </div>
            <p className="data-description">See how much storage you're using</p>
          </div>
          <div className="data-usage" role="progressbar" aria-valuenow={45} aria-valuemax={100} aria-label="Storage usage: 4.5 GB of 10 GB">
            <div className="usage-bar">
              <div className="usage-fill" style={{ width: '45%' }}></div>
            </div>
            <span className="usage-text" aria-live="polite">4.5 GB of 10 GB used</span>
          </div>
        </div>

        <div className="data-action danger">
          <div className="data-info">
            <div className="data-title">
              <ICONS.Trash2 size={20} aria-hidden="true" />
              Delete Account
            </div>
            <p className="data-description">Permanently delete your account and all data</p>
          </div>
          <button
            className="btn-danger"
            aria-label="Delete account permanently"
          >
            Delete Account
          </button>
        </div>
      </Card>
    </div>
  )
})