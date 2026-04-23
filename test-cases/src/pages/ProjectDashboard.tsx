import { useState } from 'react'
import { ProjectCard, Card } from '../components/Card'
import { mockProjects } from '../data/mockData'
import { Search, Plus, Filter, FolderKanban, Play, CheckCircle, Pause, Clock } from 'lucide-react'
import './Dashboard.css'

export function ProjectDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)

  // Filter projects based on search term and status
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleProjectClick = (projectId: string) => {
    console.log(`Opening project ${projectId}`)
    // Here you would typically navigate to a detailed project view
  }

  const statusOptions = ['all', 'active', 'completed', 'on-hold', 'planning']

  // Calculate stats
  const totalProjects = mockProjects.length
  const activeProjects = mockProjects.filter(p => p.status === 'active').length
  const completedProjects = mockProjects.filter(p => p.status === 'completed').length
  const onHoldProjects = mockProjects.filter(p => p.status === 'on-hold').length
  const planningProjects = mockProjects.filter(p => p.status === 'planning').length

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Project Dashboard</h1>
          <p className="dashboard-subtitle">
            Track and manage all your projects in one place
          </p>
        </div>

        <button
          className="btn-primary add-user-btn"
          onClick={() => setShowCreateProjectModal(true)}
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="metrics-grid small-metrics">
        <Card className="stat-card">
          <div className="stat-content">
            <FolderKanban size={24} className="stat-icon" style={{ color: '#3b82f6' }} />
            <div>
              <div className="stat-value">{totalProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Play size={24} className="stat-icon" style={{ color: '#10b981' }} />
            <div>
              <div className="stat-value">{activeProjects}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <CheckCircle size={24} className="stat-icon" style={{ color: '#8b5cf6' }} />
            <div>
              <div className="stat-value">{completedProjects}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Pause size={24} className="stat-icon" style={{ color: '#f59e0b' }} />
            <div>
              <div className="stat-value">{onHoldProjects}</div>
              <div className="stat-label">On Hold</div>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Clock size={24} className="stat-icon" style={{ color: '#6b7280' }} />
            <div>
              <div className="stat-value">{planningProjects}</div>
              <div className="stat-label">Planning</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and View Controls */}
      <Card className="filters-card">
        <div className="filters-content">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={20} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>

            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects Display */}
      <div className={`projects-container ${viewMode}`}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
            />
          ))
        ) : (
          <Card className="empty-state">
            <div className="empty-content">
              <FolderKanban size={48} className="empty-icon" />
              <h3>No projects found</h3>
              <p>Try adjusting your search criteria or create a new project.</p>
              <button
                className="btn-primary"
                onClick={() => setShowCreateProjectModal(true)}
              >
                Create Project
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Create Project Modal (placeholder) */}
      {showCreateProjectModal && (
        <div className="modal-overlay" onClick={() => setShowCreateProjectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" placeholder="Enter project name" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Project description" rows={3}></textarea>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateProjectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowCreateProjectModal(false)}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}