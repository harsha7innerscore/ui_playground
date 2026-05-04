# AnalyticsDashboard Module — Test Documentation

## 1. Module Overview

- **Entry point**: `src/pages/AnalyticsDashboard.tsx`
- **Route**: Not directly routed (standalone component)
- **Purpose**: Displays business analytics dashboard with key metrics, charts, and recent activity data for monitoring performance.
- **Key dependencies**: react v19.2.5, recharts v3.8.1, lucide-react v1.8.0, react-router-dom v7.14.2

---

## 2. Component Tree

```
AnalyticsDashboard (/Users/coschool/Desktop/code/ui_playground/test-cases/src/pages/AnalyticsDashboard.tsx)
├── MetricCard (/Users/coschool/Desktop/code/ui_playground/test-cases/src/components/Card.tsx) × 4 instances
│   └── Card (/Users/coschool/Desktop/code/ui_playground/test-cases/src/components/Card.tsx)
├── Card (/Users/coschool/Desktop/code/ui_playground/test-cases/src/components/Card.tsx) × 4 chart containers
│   ├── LineChart (recharts) — User Growth
│   ├── BarChart (recharts) — Monthly Revenue
│   ├── PieChart (recharts) — Project Status
│   └── Activity List (local component) — Recent Activity
└── mockData (/Users/coschool/Desktop/code/ui_playground/test-cases/src/data/mockData.ts) — Data source
```

---

## 3. File-by-File Breakdown

### `src/pages/AnalyticsDashboard.tsx`

**Type**: Page Component

**Exported**: `export function AnalyticsDashboard()`

**Props / Signature**

```ts
// No props interface - standalone page component
export function AnalyticsDashboard(): JSX.Element;
```

**State**

- `selectedTimeRange: '7d' | '30d' | '90d' | '1y'` — controlled by local useState, defaults to '30d'

**Side Effects**

- None — component uses static mock data

**Event Handlers**

- `handleMetricClick(title: string)` — logs metric title to console, placeholder for navigation
- `setSelectedTimeRange(option.value)` — updates time range state on button click

**API Interactions**

- None — uses static mock data from `mockData.ts`

**Conditional Rendering**

- Time range buttons: active state based on `selectedTimeRange === option.value`
- Activity list: renders only first 5 items from `mockActivity.slice(0, 5)`

**Routing**

- None — no routing logic within component

**Testable Units (this file)**

1. Renders dashboard title and subtitle correctly
2. Renders all 4 time range buttons with correct labels
3. Sets active class on selected time range button
4. Updates selectedTimeRange state when time range button clicked
5. Calls handleMetricClick with correct title when metric card clicked
6. Renders correct number of MetricCard components (4)
7. Renders 4 chart cards with correct titles
8. Renders LineChart with user growth data
9. Renders BarChart with revenue data
10. Renders PieChart with project status data
11. Renders exactly 5 activity items
12. Formats activity timestamps correctly

---

### `src/components/Card.tsx`

**Type**: Presentational Component

**Exported**: `export function Card`, `export function MetricCard`, `export function UserCard`, `export function ProjectCard`

**Props / Signature**

```ts
interface BaseCardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}
```

**State**

- None — stateless presentational components

**Side Effects**

- None

**Event Handlers**

- `onClick` — forwarded to Card component, triggers parent callback

**API Interactions**

- None

**Conditional Rendering**

- `Icon && <Icon />` — renders icon only if provided
- `change &&` — renders change indicator only if change prop provided
- CSS classes applied conditionally: `hover`, `card-clickable`, `active` states

**Testable Units (this file)**

1. Card renders children correctly
2. Card applies hover class when hover=true
3. Card applies clickable class when onClick provided
4. Card triggers onClick when clicked
5. MetricCard renders title, value correctly
6. MetricCard renders icon when provided with correct color
7. MetricCard renders change indicator with correct type styling
8. MetricCard triggers onClick callback when clicked
9. Change indicator shows correct styling for increase/decrease/neutral types

---

### `src/data/mockData.ts`

**Type**: Data/Types

**Exported**: `export const mockMetrics`, `export const chartData`, `export const mockActivity`, type interfaces

**Props / Signature**

```ts
interface MetricData {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: string;
  iconColor?: string;
}

interface ActivityItem {
  id: string;
  type:
    | "user_joined"
    | "project_created"
    | "project_completed"
    | "user_updated";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}
```

**Testable Units (this file)**

1. mockMetrics contains exactly 4 metric objects
2. Each metric has required title, value, change properties
3. chartData.userGrowth contains 6 months of data
4. chartData.revenue contains 6 months of data
5. chartData.projectStatus contains 4 status types
6. mockActivity contains valid ActivityItem objects
7. Activity timestamps are valid ISO date strings

---

## 4. Custom Hooks Reference

_No custom hooks in this module._

---

## 5. API Contract Summary

_No API calls in this module — uses static mock data only._

| Method | Endpoint | Trigger | Success shape | Error handling |
| ------ | -------- | ------- | ------------- | -------------- |
| N/A    | N/A      | N/A     | N/A           | N/A            |

---

## 6. State Management

_No external state management (Redux/Zustand) — uses only local React state._

### Local State

- **State shape**:

```ts
{
  selectedTimeRange: "7d" | "30d" | "90d" | "1y";
}
```

- **Updates**: Direct setState via `setSelectedTimeRange`
- **Jest approach**: test state changes via user interactions, assert UI updates

---

## 7. Form Validation Rules

_No forms in this module._

---

## 8. Permission / Auth Guards

_No authentication or authorization logic in this module._

---

## 9. Jest Test Plan

A flat, prioritized list of test cases for this module.
Format: `[PRIORITY] FileName > describe block > it description`

**Priority**: P0 = must-have, P1 = high value, P2 = nice-to-have

```
[P0] AnalyticsDashboard.test.tsx > AnalyticsDashboard > renders dashboard title and subtitle
[P0] AnalyticsDashboard.test.tsx > AnalyticsDashboard > renders all 4 metric cards with correct data
[P0] AnalyticsDashboard.test.tsx > AnalyticsDashboard > renders all 4 chart containers
[P0] AnalyticsDashboard.test.tsx > AnalyticsDashboard > renders exactly 5 activity items
[P0] AnalyticsDashboard.test.tsx > AnalyticsDashboard > time range selector shows 4 buttons with correct labels
[P0] AnalyticsDashboard.test.tsx > AnalyticsDashboard > default time range is 30d
[P1] AnalyticsDashboard.test.tsx > AnalyticsDashboard > clicking time range button updates selected state
[P1] AnalyticsDashboard.test.tsx > AnalyticsDashboard > active time range button has active class
[P1] AnalyticsDashboard.test.tsx > AnalyticsDashboard > clicking metric card calls handleMetricClick with title
[P1] AnalyticsDashboard.test.tsx > AnalyticsDashboard > console.log is called when metric clicked
[P1] AnalyticsDashboard.test.tsx > AnalyticsDashboard > activity timestamps are formatted correctly
[P1] Card.test.tsx > Card > renders children correctly
[P1] Card.test.tsx > Card > applies hover class when hover prop is true
[P1] Card.test.tsx > Card > applies clickable class when onClick provided
[P1] Card.test.tsx > Card > triggers onClick when clicked
[P1] Card.test.tsx > MetricCard > renders title and value correctly
[P1] Card.test.tsx > MetricCard > renders icon with correct color when provided
[P1] Card.test.tsx > MetricCard > renders change indicator with correct styling
[P1] Card.test.tsx > MetricCard > triggers onClick when clicked
[P1] Card.test.tsx > MetricCard > shows increase styling for positive changes
[P1] Card.test.tsx > MetricCard > shows decrease styling for negative changes
[P1] Card.test.tsx > MetricCard > shows neutral styling for neutral changes
[P2] mockData.test.ts > mockData > mockMetrics contains 4 items
[P2] mockData.test.ts > mockData > chartData has correct structure
[P2] mockData.test.ts > mockData > activity items have valid timestamps
[P2] AnalyticsDashboard.test.tsx > AnalyticsDashboard > charts render with correct data props
[P2] AnalyticsDashboard.test.tsx > AnalyticsDashboard > matches component snapshot
```

---

## 10. Mocking Guide

Describes what must be mocked in Jest for this module to work in isolation.

| What                  | How to mock                                                                    | Notes                                              |
| --------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| `recharts` components | `jest.mock('recharts')` with mock components returning test IDs                | Use simple divs with data-testid for chart testing |
| `lucide-react` icons  | `jest.mock('lucide-react')` returning mock icon components                     | Return simple divs with icon name as data-testid   |
| `console.log`         | `jest.spyOn(console, 'log').mockImplementation(() => {})`                      | Verify handleMetricClick calls                     |
| CSS modules           | Use `identity-obj-proxy` in jest config                                        | CSS classes become strings                         |
| Date formatting       | `jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('1/1/2024')` | Control date output for consistent tests           |

### Standard test wrapper factory

```ts
// tests/utils/renderWithProviders.tsx
import { render } from '@testing-library/react'
import { ReactElement } from 'react'

export function renderAnalyticsDashboard(
  ui: ReactElement,
  options = {}
) {
  return render(ui, {
    ...options
  })
}

// For integration tests with routing (if needed later)
import { MemoryRouter } from 'react-router-dom'

export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  )
}
```

### Mock implementations

```ts
// __mocks__/recharts.tsx
export const ResponsiveContainer = ({ children }: any) => <div data-testid="responsive-container">{children}</div>
export const LineChart = ({ children }: any) => <div data-testid="line-chart">{children}</div>
export const BarChart = ({ children }: any) => <div data-testid="bar-chart">{children}</div>
export const PieChart = ({ children }: any) => <div data-testid="pie-chart">{children}</div>
export const XAxis = () => <div data-testid="x-axis" />
export const YAxis = () => <div data-testid="y-axis" />
export const CartesianGrid = () => <div data-testid="cartesian-grid" />
export const Tooltip = () => <div data-testid="tooltip" />
export const Line = () => <div data-testid="line" />
export const Bar = () => <div data-testid="bar" />
export const Pie = () => <div data-testid="pie" />
export const Cell = () => <div data-testid="cell" />

// __mocks__/lucide-react.tsx
export const Users = () => <div data-testid="icon-users" />
export const FolderKanban = () => <div data-testid="icon-folder-kanban" />
export const DollarSign = () => <div data-testid="icon-dollar-sign" />
export const CheckCircle = () => <div data-testid="icon-check-circle" />
export const TrendingUp = () => <div data-testid="icon-trending-up" />
export const Activity = () => <div data-testid="icon-activity" />
```

---

## 11. Edge Cases & Boundary Conditions

List non-obvious scenarios the test suite should cover:

- **Empty/null data scenarios**: Test behavior when mockMetrics is empty array
- **Missing optional props**: MetricCard without icon, without change data
- **Large numbers**: Ensure metric values display correctly with thousands/millions
- **Icon mapping**: Test behavior when metric title doesn't exist in iconMap
- **Time range edge case**: Ensure all 4 time range options work correctly
- **Activity list boundary**: Test with more/fewer than 5 activity items in mock data
- **Chart data structure**: Test with malformed chart data (missing properties)
- **CSS class application**: Verify active class toggling works correctly
- **Event handler edge cases**: Multiple rapid clicks on time range buttons
- **Date formatting edge cases**: Invalid timestamps in activity data
- **Component unmounting**: Ensure no memory leaks or lingering timers

---

## Summary

- **Total files traced**: 3 main files (AnalyticsDashboard.tsx, Card.tsx, mockData.ts)
- **Total testable units found**: 35 test cases identified
- **Number of P0 test cases**: 7 critical tests for core functionality
- **Dependencies**: Recharts for charts, Lucide React for icons, TypeScript for types
- **Testing approach**: Isolated unit tests with mocked external dependencies

This document is ready to be passed to a Jest test-generation LLM. Point it at `AnalyticsDashboard-test-docs.md` and ask it to implement the test plan in Section 9 using the mocking patterns in Section 10.
