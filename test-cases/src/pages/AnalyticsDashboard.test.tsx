import { render, screen, fireEvent } from '@testing-library/react'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { mockMetrics, chartData, mockActivity } from '../data/mockData'

// Mock recharts and lucide-react
jest.mock('recharts')
jest.mock('lucide-react')

// Mock console.log to verify handleMetricClick calls
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    consoleSpy.mockClear()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  // P0 Tests - Critical functionality
  describe('Core rendering (P0)', () => {
    test('renders dashboard title and subtitle', () => {
      render(<AnalyticsDashboard />)

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Monitor your business performance and key metrics')).toBeInTheDocument()
    })

    test('renders all 4 metric cards with correct data', () => {
      render(<AnalyticsDashboard />)

      mockMetrics.forEach((metric) => {
        expect(screen.getByText(metric.title)).toBeInTheDocument()
        expect(screen.getByText(metric.value.toString())).toBeInTheDocument()
        if (metric.change) {
          expect(screen.getByText(metric.change.value)).toBeInTheDocument()
        }
      })
    })

    test('renders all 4 chart containers', () => {
      render(<AnalyticsDashboard />)

      expect(screen.getByText('User Growth')).toBeInTheDocument()
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
      expect(screen.getByText('Project Status')).toBeInTheDocument()
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })

    test('renders exactly 5 activity items', () => {
      const { container } = render(<AnalyticsDashboard />)

      const activityItems = container.querySelectorAll('.activity-item')
      expect(activityItems).toHaveLength(5)

      // Verify first 5 activities are displayed
      mockActivity.slice(0, 5).forEach((activity) => {
        expect(screen.getByText(activity.title)).toBeInTheDocument()
        expect(screen.getByText(activity.description)).toBeInTheDocument()
      })
    })

    test('time range selector shows 4 buttons with correct labels', () => {
      render(<AnalyticsDashboard />)

      expect(screen.getByText('7 Days')).toBeInTheDocument()
      expect(screen.getByText('30 Days')).toBeInTheDocument()
      expect(screen.getByText('90 Days')).toBeInTheDocument()
      expect(screen.getByText('1 Year')).toBeInTheDocument()
    })

    test('default time range is 30d', () => {
      render(<AnalyticsDashboard />)

      const thirtyDayButton = screen.getByText('30 Days')
      expect(thirtyDayButton).toHaveClass('active')
    })
  })

  // P1 Tests - High value functionality
  describe('Interaction behaviors (P1)', () => {
    test('clicking time range button updates selected state', () => {
      render(<AnalyticsDashboard />)

      const sevenDayButton = screen.getByText('7 Days')
      const thirtyDayButton = screen.getByText('30 Days')

      // Initially 30d is active
      expect(thirtyDayButton).toHaveClass('active')
      expect(sevenDayButton).not.toHaveClass('active')

      // Click 7 Days
      fireEvent.click(sevenDayButton)

      expect(sevenDayButton).toHaveClass('active')
      expect(thirtyDayButton).not.toHaveClass('active')
    })

    test('active time range button has active class', () => {
      render(<AnalyticsDashboard />)

      const buttons = ['7 Days', '30 Days', '90 Days', '1 Year']

      buttons.forEach((buttonText) => {
        const button = screen.getByText(buttonText)
        fireEvent.click(button)
        expect(button).toHaveClass('active')

        // Other buttons should not be active
        buttons.filter(b => b !== buttonText).forEach((otherButtonText) => {
          const otherButton = screen.getByText(otherButtonText)
          expect(otherButton).not.toHaveClass('active')
        })
      })
    })

    test('clicking metric card calls handleMetricClick with title', () => {
      render(<AnalyticsDashboard />)

      // Find metric cards and click them
      mockMetrics.forEach((metric) => {
        const metricElement = screen.getByText(metric.title).closest('.card')
        if (metricElement) {
          fireEvent.click(metricElement)
          expect(consoleSpy).toHaveBeenCalledWith(`Clicked on ${metric.title} metric`)
        }
      })
    })

    test('console.log is called when metric clicked', () => {
      render(<AnalyticsDashboard />)

      const firstMetricCard = screen.getByText(mockMetrics[0].title).closest('.card')
      if (firstMetricCard) {
        fireEvent.click(firstMetricCard)
        expect(consoleSpy).toHaveBeenCalledTimes(1)
      }
    })

    test('activity timestamps are formatted correctly', () => {
      render(<AnalyticsDashboard />)

      mockActivity.slice(0, 5).forEach((activity) => {
        const date = new Date(activity.timestamp)
        const expectedDate = date.toLocaleDateString()
        const expectedTime = date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })

        const timeElement = screen.getByText(new RegExp(`${expectedDate}.*at.*${expectedTime.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}`))
        expect(timeElement).toBeInTheDocument()
      })
    })
  })

  // P2 Tests - Nice to have
  describe('Chart and data integration (P2)', () => {
    test('charts render with correct data props', () => {
      render(<AnalyticsDashboard />)

      // Check Line Chart data
      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-data', JSON.stringify(chartData.userGrowth))

      // Check Bar Chart data
      const barChart = screen.getByTestId('bar-chart')
      expect(barChart).toHaveAttribute('data-data', JSON.stringify(chartData.revenue))

      // Check Pie Chart (data passed to Pie component)
      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-data', JSON.stringify(chartData.projectStatus))
    })

    test('line chart renders with correct components', () => {
      render(<AnalyticsDashboard />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line')).toBeInTheDocument()
      expect(screen.getAllByTestId('cartesian-grid')).toHaveLength(2) // Line and Bar charts have cartesian grids
      expect(screen.getAllByTestId('tooltip')).toHaveLength(3) // One for each chart
    })

    test('bar chart renders with correct components', () => {
      render(<AnalyticsDashboard />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar')).toBeInTheDocument()
    })

    test('pie chart renders with correct components', () => {
      render(<AnalyticsDashboard />)

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie')).toBeInTheDocument()
      expect(screen.getAllByTestId('cell')).toHaveLength(4) // One for each status
    })

    test('chart icons are rendered', () => {
      render(<AnalyticsDashboard />)

      expect(screen.getByTestId('icon-trending-up')).toBeInTheDocument()
      expect(screen.getAllByTestId('icon-dollar-sign')).toHaveLength(2) // Metric + chart
      expect(screen.getAllByTestId('icon-folder-kanban')).toHaveLength(2) // Metric + chart
      expect(screen.getByTestId('icon-activity')).toBeInTheDocument()
    })

    test('renders all chart containers with correct structure', () => {
      render(<AnalyticsDashboard />)

      // Verify chart containers exist
      expect(screen.getAllByText(/User Growth|Monthly Revenue|Project Status|Recent Activity/)).toHaveLength(4)
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3) // Line, Bar, Pie charts
    })
  })

  // Edge cases and error scenarios
  describe('Edge cases', () => {
    test('handles rapid clicks on time range buttons', () => {
      render(<AnalyticsDashboard />)

      const sevenDayButton = screen.getByText('7 Days')
      const thirtyDayButton = screen.getByText('30 Days')

      // Rapid clicking
      fireEvent.click(sevenDayButton)
      fireEvent.click(thirtyDayButton)
      fireEvent.click(sevenDayButton)
      fireEvent.click(thirtyDayButton)

      // Should maintain state correctly
      expect(thirtyDayButton).toHaveClass('active')
      expect(sevenDayButton).not.toHaveClass('active')
    })

    test('activity list displays correct structure', () => {
      const { container } = render(<AnalyticsDashboard />)

      const activityItems = container.querySelectorAll('.activity-item')

      activityItems.forEach((item: Element, index: number) => {
        const activity = mockActivity[index]
        expect(item).toContainElement(screen.getByText(activity.title))
        expect(item).toContainElement(screen.getByText(activity.description))
      })
    })
  })
})