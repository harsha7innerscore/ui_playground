import { useState } from 'react'
import { UserCard, Card } from '../components/Card'
import { mockUsers } from '../data/mockData'
import { Search, Plus, Filter, Users, UserCheck, UserX, Clock } from 'lucide-react'
import './Dashboard.css'

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAddUserModal, setShowAddUserModal] = useState(false)

  // Filter users based on search term, role, and status
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase()
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleEditUser = (userId: string) => {
    console.log(`Editing user ${userId}`)
    // Here you would typically open an edit modal or navigate to an edit page
  }

  const handleDeleteUser = (userId: string) => {
    console.log(`Deleting user ${userId}`)
    // Here you would typically show a confirmation dialog and then delete the user
  }

  const roleOptions = ['all', 'administrator', 'project manager', 'developer', 'designer', 'qa engineer']
  const statusOptions = ['all', 'active', 'inactive', 'pending']

  // Calculate stats
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.status === 'active').length
  const inactiveUsers = mockUsers.filter(u => u.status === 'inactive').length
  const pendingUsers = mockUsers.filter(u => u.status === 'pending').length

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">User Management</h1>
          <p className="dashboard-subtitle">
            Manage team members and their permissions
          </p>
        </div>

        <button
          className="btn-primary add-user-btn"
          onClick={() => setShowAddUserModal(true)}
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="metrics-grid small-metrics">
        <Card className="stat-card">
          <div className="stat-content">
            <Users size={24} className="stat-icon" style={{ color: '#3b82f6' }} />
            <div>
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <UserCheck size={24} className="stat-icon" style={{ color: '#10b981' }} />
            <div>
              <div className="stat-value">{activeUsers}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <UserX size={24} className="stat-icon" style={{ color: '#ef4444' }} />
            <div>
              <div className="stat-value">{inactiveUsers}</div>
              <div className="stat-label">Inactive</div>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Clock size={24} className="stat-icon" style={{ color: '#f59e0b' }} />
            <div>
              <div className="stat-value">{pendingUsers}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-content">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={20} />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="filter-select"
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <div className="users-grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          ))
        ) : (
          <Card className="empty-state">
            <div className="empty-content">
              <Users size={48} className="empty-icon" />
              <h3>No users found</h3>
              <p>Try adjusting your search criteria or add a new user.</p>
              <button
                className="btn-primary"
                onClick={() => setShowAddUserModal(true)}
              >
                Add User
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Add User Modal (placeholder) */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            <p>This would be a form to add a new user to the system.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowAddUserModal(false)}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}