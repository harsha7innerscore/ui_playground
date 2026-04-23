import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { MetricCard, Card } from '../components/Card'
import { mockMetrics, chartData, mockActivity } from '../data/mockData'
import {
  Users,
  FolderKanban,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react'
import './Dashboard.css'

const iconMap = {
  'Total Users': Users,
  'Active Projects': FolderKanban,
  'Revenue': DollarSign,
  'Tasks Completed': CheckCircle
}

export function AnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const handleMetricClick = (title: string) => {
    console.log(`Clicked on ${title} metric`)
    // Here you could show detailed analytics or navigate to a detailed view
  }

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor your business performance and key metrics
          </p>
        </div>

        <div className="time-range-selector">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              className={`time-range-btn ${
                selectedTimeRange === option.value ? 'active' : ''
              }`}
              onClick={() => setSelectedTimeRange(option.value as any)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {mockMetrics.map((metric, index) => {
          const IconComponent = iconMap[metric.title as keyof typeof iconMap]
          return (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={IconComponent}
              iconColor={metric.iconColor}
              onClick={() => handleMetricClick(metric.title)}
            />
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* User Growth Chart */}
        <Card className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">User Growth</h3>
            <div className="chart-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Revenue</h3>
            <div className="chart-icon">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`$${value?.toLocaleString() ?? '0'}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Project Status Chart */}
        <Card className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Project Status</h3>
            <div className="chart-icon">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.projectStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="chart-card activity-card">
          <div className="chart-header">
            <h3 className="chart-title">Recent Activity</h3>
            <div className="chart-icon">
              <Activity size={20} />
            </div>
          </div>
          <div className="activity-list">
            {mockActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-content">
                  <h4 className="activity-title">{activity.title}</h4>
                  <p className="activity-description">{activity.description}</p>
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                    {new Date(activity.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}