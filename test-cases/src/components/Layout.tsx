import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import {
  BarChart3,
  Users,
  FolderKanban,
  Settings,
  Moon,
  Sun
} from 'lucide-react'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout({ children }: LayoutProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">DashHub</h1>
        </div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}