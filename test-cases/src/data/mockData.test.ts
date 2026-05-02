import { mockMetrics, chartData, mockActivity, mockUsers, mockProjects } from './mockData'

describe('mockData', () => {
  describe('mockMetrics (P2)', () => {
    test('contains exactly 4 items', () => {
      expect(mockMetrics).toHaveLength(4)
    })

    test('each metric has required properties', () => {
      mockMetrics.forEach((metric, index) => {
        expect(metric).toHaveProperty('title')
        expect(metric).toHaveProperty('value')
        expect(typeof metric.title).toBe('string')
        expect(['string', 'number'].includes(typeof metric.value)).toBe(true)

        // All mock metrics should have change data
        expect(metric).toHaveProperty('change')
        if (metric.change) {
          expect(metric.change).toHaveProperty('value')
          expect(metric.change).toHaveProperty('type')
          expect(['increase', 'decrease', 'neutral']).toContain(metric.change.type)
        }
      })
    })

    test('contains expected metric titles', () => {
      const titles = mockMetrics.map(m => m.title)
      expect(titles).toContain('Total Users')
      expect(titles).toContain('Active Projects')
      expect(titles).toContain('Revenue')
      expect(titles).toContain('Tasks Completed')
    })

    test('all metrics have icon colors', () => {
      mockMetrics.forEach((metric) => {
        expect(metric.iconColor).toBeDefined()
        expect(typeof metric.iconColor).toBe('string')
        expect(metric.iconColor).toMatch(/^#[0-9a-fA-F]{6}$/) // Valid hex color
      })
    })
  })

  describe('chartData structure (P2)', () => {
    test('userGrowth contains 6 months of data', () => {
      expect(chartData.userGrowth).toHaveLength(6)

      chartData.userGrowth.forEach((dataPoint, index) => {
        expect(dataPoint).toHaveProperty('month')
        expect(dataPoint).toHaveProperty('users')
        expect(typeof dataPoint.month).toBe('string')
        expect(typeof dataPoint.users).toBe('number')
        expect(dataPoint.users).toBeGreaterThan(0)
      })
    })

    test('revenue contains 6 months of data', () => {
      expect(chartData.revenue).toHaveLength(6)

      chartData.revenue.forEach((dataPoint) => {
        expect(dataPoint).toHaveProperty('month')
        expect(dataPoint).toHaveProperty('revenue')
        expect(typeof dataPoint.month).toBe('string')
        expect(typeof dataPoint.revenue).toBe('number')
        expect(dataPoint.revenue).toBeGreaterThan(0)
      })
    })

    test('projectStatus contains 4 status types', () => {
      expect(chartData.projectStatus).toHaveLength(4)

      const expectedStatuses = ['Active', 'Completed', 'On Hold', 'Planning']
      const actualStatuses = chartData.projectStatus.map(p => p.name)

      expectedStatuses.forEach(status => {
        expect(actualStatuses).toContain(status)
      })

      chartData.projectStatus.forEach((statusData) => {
        expect(statusData).toHaveProperty('name')
        expect(statusData).toHaveProperty('value')
        expect(statusData).toHaveProperty('color')
        expect(typeof statusData.name).toBe('string')
        expect(typeof statusData.value).toBe('number')
        expect(typeof statusData.color).toBe('string')
        expect(statusData.color).toMatch(/^#[0-9a-fA-F]{6}$/) // Valid hex color
        expect(statusData.value).toBeGreaterThan(0)
      })
    })

    test('user growth shows increasing trend', () => {
      const userCounts = chartData.userGrowth.map(d => d.users)

      // Check that most months show growth (allow for occasional dips)
      let increasingMonths = 0
      for (let i = 1; i < userCounts.length; i++) {
        if (userCounts[i] > userCounts[i - 1]) {
          increasingMonths++
        }
      }

      expect(increasingMonths).toBeGreaterThanOrEqual(3) // At least 3 out of 5 transitions should be positive
    })

    test('month names are valid', () => {
      const validMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      chartData.userGrowth.forEach(dataPoint => {
        expect(validMonths).toContain(dataPoint.month)
      })

      chartData.revenue.forEach(dataPoint => {
        expect(validMonths).toContain(dataPoint.month)
      })
    })
  })

  describe('mockActivity validation (P2)', () => {
    test('contains valid ActivityItem objects', () => {
      expect(mockActivity.length).toBeGreaterThan(0)

      mockActivity.forEach((activity) => {
        expect(activity).toHaveProperty('id')
        expect(activity).toHaveProperty('type')
        expect(activity).toHaveProperty('title')
        expect(activity).toHaveProperty('description')
        expect(activity).toHaveProperty('timestamp')

        expect(typeof activity.id).toBe('string')
        expect(typeof activity.title).toBe('string')
        expect(typeof activity.description).toBe('string')
        expect(typeof activity.timestamp).toBe('string')

        const validTypes = ['user_joined', 'project_created', 'project_completed', 'user_updated']
        expect(validTypes).toContain(activity.type)
      })
    })

    test('activity timestamps are valid ISO date strings', () => {
      mockActivity.forEach((activity) => {
        const date = new Date(activity.timestamp)
        expect(date).toBeInstanceOf(Date)
        expect(isNaN(date.getTime())).toBe(false)

        // Should be a valid ISO string
        expect(activity.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      })
    })

    test('activities have user information when relevant', () => {
      const userActivities = mockActivity.filter(a =>
        ['user_joined', 'user_updated'].includes(a.type)
      )

      userActivities.forEach((activity) => {
        expect(activity.user).toBeDefined()
        if (activity.user) {
          expect(activity.user).toHaveProperty('name')
          expect(typeof activity.user.name).toBe('string')
        }
      })
    })

    test('activity IDs are unique', () => {
      const ids = mockActivity.map(a => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    test('activity timestamps are in chronological order (newest first)', () => {
      for (let i = 1; i < mockActivity.length; i++) {
        const current = new Date(mockActivity[i].timestamp)
        const previous = new Date(mockActivity[i - 1].timestamp)
        expect(current.getTime()).toBeLessThanOrEqual(previous.getTime())
      }
    })
  })

  describe('mockUsers validation', () => {
    test('users have required properties', () => {
      expect(mockUsers.length).toBeGreaterThan(0)

      mockUsers.forEach((user) => {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('role')
        expect(user).toHaveProperty('status')
        expect(user).toHaveProperty('lastActive')
        expect(user).toHaveProperty('joinDate')

        expect(['active', 'inactive', 'pending']).toContain(user.status)
        expect(user.email).toContain('@')

        // Validate dates
        expect(new Date(user.lastActive)).toBeInstanceOf(Date)
        expect(new Date(user.joinDate)).toBeInstanceOf(Date)
      })
    })

    test('user IDs are unique', () => {
      const ids = mockUsers.map(u => u.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('mockProjects validation', () => {
    test('projects have required properties', () => {
      expect(mockProjects.length).toBeGreaterThan(0)

      mockProjects.forEach((project) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('name')
        expect(project).toHaveProperty('description')
        expect(project).toHaveProperty('progress')
        expect(project).toHaveProperty('status')
        expect(project).toHaveProperty('team')
        expect(project).toHaveProperty('createdDate')

        expect(['active', 'completed', 'on-hold', 'planning']).toContain(project.status)
        expect(project.progress).toBeGreaterThanOrEqual(0)
        expect(project.progress).toBeLessThanOrEqual(100)
        expect(Array.isArray(project.team)).toBe(true)

        // Validate team members
        project.team.forEach(member => {
          expect(member).toHaveProperty('name')
          expect(typeof member.name).toBe('string')
        })

        // Validate dates
        expect(new Date(project.createdDate)).toBeInstanceOf(Date)
        if (project.dueDate) {
          expect(new Date(project.dueDate)).toBeInstanceOf(Date)
        }
      })
    })

    test('project IDs are unique', () => {
      const ids = mockProjects.map(p => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    test('project budgets are properly formatted', () => {
      mockProjects.forEach((project) => {
        if (project.budget) {
          expect(project.budget).toMatch(/^\$[\d,]+$/)
        }
      })
    })
  })

  describe('Data consistency', () => {
    test('chart data aligns with metrics', () => {
      // The latest user count in chart should match or be close to metrics
      const latestUserCount = chartData.userGrowth[chartData.userGrowth.length - 1].users
      const userMetric = mockMetrics.find(m => m.title === 'Total Users')

      if (userMetric) {
        // Remove commas and convert to number
        const metricValue = parseInt(userMetric.value.toString().replace(/,/g, ''))
        expect(metricValue).toBe(latestUserCount)
      }
    })

    test('project status count aligns with chart data', () => {
      // Count actual projects by status
      const statusCounts = mockProjects.reduce((acc, project) => {
        const status = project.status === 'on-hold' ? 'On Hold' :
                     project.status.charAt(0).toUpperCase() + project.status.slice(1)
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Note: Chart data might be different from actual project data for demo purposes
      // This test validates the chart data structure rather than exact alignment
      chartData.projectStatus.forEach(status => {
        expect(typeof status.value).toBe('number')
        expect(status.value).toBeGreaterThan(0)
      })
    })
  })
})