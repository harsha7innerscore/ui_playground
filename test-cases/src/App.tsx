import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AnalyticsDashboard } from './pages/AnalyticsDashboard'
import { UserManagement } from './pages/UserManagement'
import { ProjectDashboard } from './pages/ProjectDashboard'
import { SettingsDashboard } from './pages/SettingsDashboard'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<AnalyticsDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/projects" element={<ProjectDashboard />} />
            <Route path="/settings" element={<SettingsDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App