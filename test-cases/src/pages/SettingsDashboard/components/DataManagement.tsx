import { memo, useState } from 'react'
import { Download, Database, Trash2 } from 'lucide-react'
import { Card } from '../../../components/Card'
import type { DataUsage } from '../types'
import { DEFAULT_DATA_USAGE } from '../constants'

interface DataManagementProps {
  dataUsage?: DataUsage
}

export const DataManagement = memo(function DataManagement({
  dataUsage = DEFAULT_DATA_USAGE
}: DataManagementProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = () => {
    if (showDeleteConfirmation) {
      // Handle actual deletion
      console.log('Account deletion requested')
      setShowDeleteConfirmation(false)
    } else {
      setShowDeleteConfirmation(true)
    }
  }

  return (
    <div className="settings-content">
      <h2>Data Management</h2>

      <Card className="settings-card">
        <div className="data-action" data-testid="export-data-section">
          <div className="data-info">
            <div className="data-title">
              <Download size={20} aria-hidden="true" />
              Export Data
            </div>
            <p className="data-description">Download a copy of your data</p>
          </div>
          <button
            className="btn-secondary"
            onClick={handleExportData}
            disabled={isExporting}
            aria-label={isExporting ? 'Exporting data...' : 'Export your data'}
            data-testid="export-data-btn"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>

        <div className="data-action" data-testid="data-usage-section">
          <div className="data-info">
            <div className="data-title">
              <Database size={20} aria-hidden="true" />
              Data Usage
            </div>
            <p className="data-description">See how much storage you're using</p>
          </div>
          <div className="data-usage">
            <div className="usage-bar" role="progressbar" aria-valuenow={dataUsage.percentage} aria-valuemin={0} aria-valuemax={100}>
              <div className="usage-fill" style={{ width: `${dataUsage.percentage}%` }}></div>
            </div>
            <span className="usage-text" aria-label={`Using ${dataUsage.used} GB of ${dataUsage.total} GB total storage`}>
              {dataUsage.used} GB of {dataUsage.total} GB used
            </span>
          </div>
        </div>

        <div className="data-action danger" data-testid="delete-account-section">
          <div className="data-info">
            <div className="data-title">
              <Trash2 size={20} aria-hidden="true" />
              Delete Account
            </div>
            <p className="data-description">
              Permanently delete your account and all data
            </p>
            {showDeleteConfirmation && (
              <div className="confirmation-warning" role="alert">
                <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
              </div>
            )}
          </div>
          <div className="delete-actions">
            {showDeleteConfirmation ? (
              <>
                <button
                  className="btn-secondary"
                  onClick={() => setShowDeleteConfirmation(false)}
                  data-testid="cancel-delete-btn"
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                  data-testid="confirm-delete-btn"
                  aria-label="Confirm account deletion"
                >
                  Yes, Delete Account
                </button>
              </>
            ) : (
              <button
                className="btn-danger"
                onClick={handleDeleteAccount}
                data-testid="delete-account-btn"
                aria-label="Delete account"
              >
                Delete Account
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
})