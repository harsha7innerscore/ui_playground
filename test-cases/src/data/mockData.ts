export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  lastActive: string
  joinDate: string
}

export interface Project {
  id: string
  name: string
  description: string
  progress: number
  status: 'active' | 'completed' | 'on-hold' | 'planning'
  team: { name: string; avatar?: string }[]
  dueDate?: string
  createdDate: string
  budget?: string
}

export interface MetricData {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: string
  iconColor?: string
}

export interface ActivityItem {
  id: string
  type: 'user_joined' | 'project_created' | 'project_completed' | 'user_updated'
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
}

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    role: 'Administrator',
    status: 'active',
    lastActive: '2024-04-22T10:30:00Z',
    joinDate: '2023-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.williams@company.com',
    role: 'Project Manager',
    status: 'active',
    lastActive: '2024-04-22T09:15:00Z',
    joinDate: '2023-02-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    role: 'Developer',
    status: 'active',
    lastActive: '2024-04-22T08:45:00Z',
    joinDate: '2023-03-10T00:00:00Z'
  },
  {
    id: '4',
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    role: 'Designer',
    status: 'inactive',
    lastActive: '2024-04-18T16:20:00Z',
    joinDate: '2023-04-05T00:00:00Z'
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'Developer',
    status: 'pending',
    lastActive: '2024-04-21T14:10:00Z',
    joinDate: '2024-04-20T00:00:00Z'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    role: 'QA Engineer',
    status: 'active',
    lastActive: '2024-04-22T11:00:00Z',
    joinDate: '2023-05-15T00:00:00Z'
  }
]

// Mock Projects Data
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js',
    progress: 85,
    status: 'active',
    team: [
      { name: 'Alex Chen' },
      { name: 'Sarah Williams' },
      { name: 'Michael Rodriguez' },
      { name: 'Emily Johnson' }
    ],
    dueDate: '2024-05-15T00:00:00Z',
    createdDate: '2024-01-10T00:00:00Z',
    budget: '$125,000'
  },
  {
    id: '2',
    name: 'Mobile App Redesign',
    description: 'Complete UI/UX redesign of the mobile application',
    progress: 60,
    status: 'active',
    team: [
      { name: 'Emily Johnson' },
      { name: 'Lisa Thompson' },
      { name: 'David Kim' }
    ],
    dueDate: '2024-06-01T00:00:00Z',
    createdDate: '2024-02-15T00:00:00Z',
    budget: '$85,000'
  },
  {
    id: '3',
    name: 'API Documentation',
    description: 'Create comprehensive API documentation for developers',
    progress: 100,
    status: 'completed',
    team: [
      { name: 'Michael Rodriguez' },
      { name: 'Alex Chen' }
    ],
    dueDate: '2024-04-01T00:00:00Z',
    createdDate: '2024-03-01T00:00:00Z',
    budget: '$25,000'
  },
  {
    id: '4',
    name: 'Data Analytics Dashboard',
    description: 'Build internal analytics dashboard for business insights',
    progress: 30,
    status: 'on-hold',
    team: [
      { name: 'Sarah Williams' },
      { name: 'Michael Rodriguez' }
    ],
    dueDate: '2024-07-30T00:00:00Z',
    createdDate: '2024-03-20T00:00:00Z',
    budget: '$95,000'
  },
  {
    id: '5',
    name: 'Security Audit',
    description: 'Comprehensive security audit and penetration testing',
    progress: 15,
    status: 'planning',
    team: [
      { name: 'Alex Chen' },
      { name: 'Lisa Thompson' }
    ],
    dueDate: '2024-08-15T00:00:00Z',
    createdDate: '2024-04-15T00:00:00Z',
    budget: '$60,000'
  }
]

// Mock Metrics Data
export const mockMetrics: MetricData[] = [
  {
    title: 'Total Users',
    value: '2,847',
    change: {
      value: '+12.5%',
      type: 'increase'
    },
    iconColor: '#3b82f6'
  },
  {
    title: 'Active Projects',
    value: '24',
    change: {
      value: '+3',
      type: 'increase'
    },
    iconColor: '#10b981'
  },
  {
    title: 'Revenue',
    value: '$94,567',
    change: {
      value: '+8.2%',
      type: 'increase'
    },
    iconColor: '#8b5cf6'
  },
  {
    title: 'Tasks Completed',
    value: '1,264',
    change: {
      value: '-2.1%',
      type: 'decrease'
    },
    iconColor: '#f59e0b'
  }
]

// Mock Activity Data
export const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'user_joined',
    title: 'New user registered',
    description: 'David Kim joined as a Developer',
    timestamp: '2024-04-22T10:30:00Z',
    user: { name: 'David Kim' }
  },
  {
    id: '2',
    type: 'project_completed',
    title: 'Project completed',
    description: 'API Documentation project was completed successfully',
    timestamp: '2024-04-22T09:15:00Z',
    user: { name: 'Michael Rodriguez' }
  },
  {
    id: '3',
    type: 'project_created',
    title: 'New project created',
    description: 'Security Audit project was created',
    timestamp: '2024-04-22T08:45:00Z',
    user: { name: 'Alex Chen' }
  },
  {
    id: '4',
    type: 'user_updated',
    title: 'User role updated',
    description: 'Sarah Williams was promoted to Senior Project Manager',
    timestamp: '2024-04-21T16:20:00Z',
    user: { name: 'Sarah Williams' }
  },
  {
    id: '5',
    type: 'project_created',
    title: 'Project milestone reached',
    description: 'E-commerce Platform reached 85% completion',
    timestamp: '2024-04-21T14:10:00Z',
    user: { name: 'Sarah Williams' }
  }
]

// Chart Data for Analytics
export const chartData = {
  userGrowth: [
    { month: 'Jan', users: 1240 },
    { month: 'Feb', users: 1456 },
    { month: 'Mar', users: 1789 },
    { month: 'Apr', users: 2134 },
    { month: 'May', users: 2456 },
    { month: 'Jun', users: 2847 }
  ],
  projectStatus: [
    { name: 'Active', value: 12, color: '#10b981' },
    { name: 'Completed', value: 8, color: '#3b82f6' },
    { name: 'On Hold', value: 3, color: '#f59e0b' },
    { name: 'Planning', value: 1, color: '#8b5cf6' }
  ],
  revenue: [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 74000 },
    { month: 'Jun', revenue: 94567 }
  ]
}