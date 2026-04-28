import React from 'react'
import type { LucideIcon } from 'lucide-react'
import './Card.css'

interface BaseCardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  hover?: boolean
}

export function Card({ className = '', children, onClick, hover = true }: BaseCardProps) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: LucideIcon
  iconColor?: string
  onClick?: () => void
}

export function MetricCard({ title, value, change, icon: Icon, iconColor, onClick }: MetricCardProps) {
  return (
    <Card onClick={onClick}>
      <div className="metric-card">
        <div className="metric-header">
          <h3 className="metric-title">{title}</h3>
          {Icon && (
            <div className="metric-icon" style={{ color: iconColor }}>
              <Icon size={24} />
            </div>
          )}
        </div>

        <div className="metric-value">{value}</div>

        {change && (
          <div className={`metric-change metric-change-${change.type}`}>
            {change.value}
          </div>
        )}
      </div>
    </Card>
  )
}

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    status: 'active' | 'inactive' | 'pending'
  }
  onEdit?: (userId: string) => void
  onDelete?: (userId: string) => void
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card>
      <div className="user-card">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className="avatar-placeholder">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
        </div>

        <div className="user-info">
          <h4 className="user-name">{user.name}</h4>
          <p className="user-email">{user.email}</p>
          <div className="user-meta">
            <span className="user-role">{user.role}</span>
            <span className={`user-status user-status-${user.status}`}>
              {user.status}
            </span>
          </div>
        </div>

        <div className="user-actions">
          {onEdit && (
            <button
              className="btn-action btn-primary"
              onClick={() => onEdit(user.id)}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="btn-action btn-danger"
              onClick={() => onDelete(user.id)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    progress: number
    status: 'active' | 'completed' | 'on-hold' | 'planning'
    team: { name: string; avatar?: string }[]
    dueDate?: string
  }
  onClick?: (projectId: string) => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'completed': return '#3b82f6'
      case 'on-hold': return '#f59e0b'
      case 'planning': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  return (
    <Card onClick={() => onClick?.(project.id)}>
      <div className="project-card">
        <div className="project-header">
          <h4 className="project-name">{project.name}</h4>
          <span
            className="project-status"
            style={{
              backgroundColor: getStatusColor(project.status),
              color: 'white'
            }}
          >
            {project.status.replace('-', ' ')}
          </span>
        </div>

        <p className="project-description">{project.description}</p>

        <div className="project-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="progress-text">{project.progress}%</span>
        </div>

        <div className="project-footer">
          <div className="project-team">
            {project.team.slice(0, 3).map((member, idx) => (
              <div key={idx} className="team-avatar">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} />
                ) : (
                  <div className="avatar-placeholder-small">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
            ))}
            {project.team.length > 3 && (
              <div className="team-count">+{project.team.length - 3}</div>
            )}
          </div>

          {project.dueDate && (
            <div className="project-due-date">
              Due: {new Date(project.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}