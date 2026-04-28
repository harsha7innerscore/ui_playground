# AnalyticsDashboard Module — Test Documentation

## 1. Module Overview

- **Entry point**: `src/pages/AnalyticsDashboard.tsx`
- **Route**: `/` (default) and `/analytics`
- **Purpose**: Displays business analytics including key metrics (users, projects, revenue, tasks), data visualizations (line chart for user growth, bar chart for revenue, pie chart for project status), and recent activity feed with time range filtering capabilities.
- **Key dependencies**:
  - react 19.2.5
  - react-router-dom 7.14.2
  - recharts 3.8.1
  - lucide-react 1.8.0
  - TypeScript 6.0.2

---

## 2. Component Tree

```
AnalyticsDashboard (src/pages/AnalyticsDashboard.tsx)
├── MetricCard × 4 (src/components/Card.tsx)
│   └── Card (src/components/Card.tsx)
├── Card × 4 (chart containers)
│   ├── ResponsiveContainer (recharts)
│   │   ├── LineChart (recharts) — User Growth
│   │   │   ├── CartesianGrid
│   │   │   ├── XAxis
│   │   │   ├── YAxis
│   │   │   ├── Tooltip
│   │   │   └── Line
│   │   ├── BarChart (recharts) — Monthly Revenue
│   │   │   ├── CartesianGrid
│   │   │   ├── XAxis
│   │   │   ├── YAxis
│   │   │   ├── Tooltip
│   │   │   └── Bar
│   │   └── PieChart (recharts) — Project Status
│   │       ├── Pie
│   │       │   └── Cell × n
│   │       └── Tooltip
│   └── Activity List (inline rendering)
└── Time Range Selector (inline buttons)
```

**Data Sources** (imported from `src/data/mockData.ts`):

- `mockMetrics` — 4 metric cards
- `chartData.userGrowth` — Line chart data
- `chartData.revenue` — Bar chart data
- `chartData.projectStatus` — Pie chart data
- `mockActivity` — Activity feed (sliced to 5 items)

**Icons** (from lucide-react):

- Users, FolderKanban, DollarSign, CheckCircle (metric icons)
- TrendingUp, Activity (chart section icons)

---

## 3. File-by-File Breakdown

### `src/pages/AnalyticsDashboard.tsx`

**Type**: Page Component

**Exported**: `export function AnalyticsDashboard()`

**Props / Signature**

```ts
export function AnalyticsDashboard(): JSX.Element;
// No props — standalone page component
```

**State**

- `selectedTimeRange: '7d' | '30d' | '90d' | '1y'` — controlled by local useState, default `'30d'`

**Side Effects**

- None — purely presentational, no data fetching or subscriptions

**Event Handlers**

- `handleMetricClick(title: string)` — logs clicked metric title to console; placeholder for future navigation/drill-down
- `setSelectedTimeRange` — updates time range state when button clicked (no current effect on data — data is static)

**Data Flow**

- All data is imported from `src/data/mockData.ts` as static exports
- No API calls, no loading states, no error handling
- `iconMap` object maps metric titles to Lucide icon components

**Conditional Rendering**

- None — all sections render unconditionally
- No loading states
- No error boundaries
- No empty states (data is always present)

**Routing**

- Does not use `useNavigate`, `useParams`, or `useLocation`
- No internal navigation logic
- Rendered by route definitions in `App.tsx`

**Testable Units (this file)**

1. Renders dashboard title and subtitle
2. Renders 4 time range selector buttons
3. Sets active class on selected time range button (default: '30d')
4. Updates selectedTimeRange state when time range button clicked
5. Renders 4 MetricCard components with correct props
6. Passes correct icon components to MetricCard via iconMap
7. Calls handleMetricClick with metric title when MetricCard clicked
8. Renders User Growth LineChart with correct data
9. Renders Monthly Revenue BarChart with correct data
10. Renders Project Status PieChart with correct data and colors
11. Renders 5 activity items (sliced from mockActivity)
12. Formats activity timestamps correctly
13. Renders all chart titles and icons
14. Applies correct CSS classes

---

### `src/components/Card.tsx`

**Type**: Presentational Component (multiple exports)

**Exported**:

- `export function Card({ className, children, onClick, hover }: BaseCardProps)`
- `export function MetricCard({ title, value, change, icon: Icon, iconColor, onClick }: MetricCardProps)`
- `export function UserCard({ user, onEdit, onDelete }: UserCardProps)` — not used in AnalyticsDashboard

**Props / Signature**

```ts
interface BaseCardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean; // default: true
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

- `onClick` — forwarded from props to div element
- Adds `card-clickable` class when onClick provided
- Adds `card-hover` class by default (can be disabled with `hover={false}`)

**Conditional Rendering**

- Icon renders only if `icon` prop provided
- Change indicator renders only if `change` prop provided
- Applies different CSS classes based on `change.type`: `metric-change-increase`, `metric-change-decrease`, `metric-change-neutral`

**Testable Units (Card components)**

1. Card: renders children correctly
2. Card: applies custom className
3. Card: calls onClick when clicked (if provided)
4. Card: applies card-clickable class when onClick provided
5. Card: applies card-hover class by default
6. Card: does not apply card-hover when hover={false}
7. MetricCard: renders title, value, change correctly
8. MetricCard: renders icon with correct color
9. MetricCard: applies correct change type class
10. MetricCard: does not render icon when not provided
11. MetricCard: does not render change when not provided
12. MetricCard: forwards onClick to Card wrapper

---

### `src/data/mockData.ts`

**Type**: Data / Constants

**Exported**:

- `export const mockUsers: User[]`
- `export const mockProjects: Project[]`
- `export const mockMetrics: MetricData[]`
- `export const mockActivity: ActivityItem[]`
- `export const chartData: { userGrowth, projectStatus, revenue }`

**TypeScript Interfaces**

```ts
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  joinDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "active" | "completed" | "on-hold" | "planning";
  team: { name: string; avatar?: string }[];
  dueDate?: string;
  createdDate: string;
  budget?: string;
}

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
  timestamp: string; // ISO 8601 format
  user?: {
    name: string;
    avatar?: string;
  };
}
```

**Data Structure (used by AnalyticsDashboard)**

`mockMetrics` — array of 4 objects:

- Total Users: 2,847 (+12.5%, blue)
- Active Projects: 24 (+3, green)
- Revenue: $94,567 (+8.2%, purple)
- Tasks Completed: 1,264 (-2.1%, orange)

`chartData.userGrowth` — array of 6 monthly data points (Jan-Jun)

- Shape: `{ month: string, users: number }[]`

`chartData.revenue` — array of 6 monthly data points (Jan-Jun)

- Shape: `{ month: string, revenue: number }[]`

`chartData.projectStatus` — array of 4 status categories

- Shape: `{ name: string, value: number, color: string }[]`
- Active: 12 (green), Completed: 8 (blue), On Hold: 3 (orange), Planning: 1 (purple)

`mockActivity` — array of 5 activity items with timestamps

**Testable Units**

- N/A — static data exports, no logic to test
- Could validate data shape in integration tests

---

## 4. Custom Hooks Reference

No custom hooks are used in this module. Data is imported directly from `mockData.ts` without any data-fetching abstraction.

---

## 5. API Contract Summary

**No API calls** — this module uses entirely static mock data.

For future integration with real APIs, expected contracts would be:

| Method | Endpoint                                   | Trigger                             | Success shape                                    | Error handling        |
| ------ | ------------------------------------------ | ----------------------------------- | ------------------------------------------------ | --------------------- |
| GET    | `/api/metrics?range={timeRange}`           | component mount / time range change | `{ data: MetricData[] }`                         | TBD - add error state |
| GET    | `/api/analytics/users?range={timeRange}`   | time range change                   | `{ data: { month: string, users: number }[] }`   | TBD - add error state |
| GET    | `/api/analytics/revenue?range={timeRange}` | time range change                   | `{ data: { month: string, revenue: number }[] }` | TBD - add error state |
| GET    | `/api/analytics/projects/status`           | component mount                     | `{ data: { name: string, value: number }[] }`    | TBD - add error state |
| GET    | `/api/activity?limit=5`                    | component mount                     | `{ data: ActivityItem[] }`                       | TBD - add error state |

---

## 6. State Management

### Local Component State

- **State shape**:

```ts
const [selectedTimeRange, setSelectedTimeRange] = useState<
  "7d" | "30d" | "90d" | "1y"
>("30d");
```

- **Initial value**: `'30d'`
- **Update trigger**: Time range button click
- **Current effect**: Updates button active state only (data is static)
- **Future intent**: Should trigger data refetch when API integration added

### Global State

- No Redux, Zustand, or Context beyond ThemeContext (not consumed by AnalyticsDashboard)
- ThemeContext provides theme toggle but is consumed only by Layout component

---

## 7. Form Validation Rules

**No forms** in this module — purely data visualization.

---

## 8. Permission / Auth Guards

**No authentication or authorization checks** in this module.

- Public route (no guards in App.tsx)
- No role-based rendering
- No protected data access

---

## 9. Jest Test Plan

A flat, prioritized list of test cases for this module.

**Priority**: P0 = must-have (core functionality), P1 = high value (user-facing), P2 = nice-to-have (edge cases)

### AnalyticsDashboard.test.tsx

```
[P0] AnalyticsDashboard > renders dashboard title "Analytics Dashboard"
[P0] AnalyticsDashboard > renders dashboard subtitle
[P0] AnalyticsDashboard > renders 4 time range selector buttons
[P0] AnalyticsDashboard > marks "30 Days" button as active by default
[P0] AnalyticsDashboard > updates active button when time range clicked
[P0] AnalyticsDashboard > renders 4 MetricCard components
[P0] AnalyticsDashboard > passes correct metric data to MetricCards
[P0] AnalyticsDashboard > renders "Total Users" metric with value "2,847"
[P0] AnalyticsDashboard > renders "Active Projects" metric with value "24"
[P0] AnalyticsDashboard > renders "Revenue" metric with value "$94,567"
[P0] AnalyticsDashboard > renders "Tasks Completed" metric with value "1,264"
[P0] AnalyticsDashboard > passes correct icon to each MetricCard via iconMap
[P0] AnalyticsDashboard > renders increase change indicator for Total Users
[P0] AnalyticsDashboard > renders decrease change indicator for Tasks Completed
[P1] AnalyticsDashboard > calls handleMetricClick with correct title when metric clicked
[P1] AnalyticsDashboard > renders User Growth chart with LineChart component
[P1] AnalyticsDashboard > renders Monthly Revenue chart with BarChart component
[P1] AnalyticsDashboard > renders Project Status chart with PieChart component
[P1] AnalyticsDashboard > passes correct data to User Growth LineChart
[P1] AnalyticsDashboard > passes correct data to Monthly Revenue BarChart
[P1] AnalyticsDashboard > passes correct data to Project Status PieChart
[P1] AnalyticsDashboard > renders chart titles correctly
[P1] AnalyticsDashboard > renders chart icons (TrendingUp, DollarSign, etc)
[P1] AnalyticsDashboard > renders 5 activity items from mockActivity
[P1] AnalyticsDashboard > displays activity title and description correctly
[P1] AnalyticsDashboard > formats activity timestamp as date and time
[P2] AnalyticsDashboard > time range state updates for all options (7d, 30d, 90d, 1y)
[P2] AnalyticsDashboard > console.log called when metric clicked (for debugging)
[P2] AnalyticsDashboard > applies correct CSS classes to dashboard elements
[P2] AnalyticsDashboard > PieChart cells have correct colors from chartData
```

### Card.test.tsx

```
[P0] Card > renders children correctly
[P0] Card > applies custom className
[P0] Card > calls onClick when clicked
[P0] Card > applies card-clickable class when onClick provided
[P0] Card > applies card-hover class by default
[P0] Card > does not apply card-hover when hover={false}
[P0] MetricCard > renders title prop
[P0] MetricCard > renders value prop (string)
[P0] MetricCard > renders value prop (number)
[P0] MetricCard > renders change indicator when change prop provided
[P0] MetricCard > applies metric-change-increase class for increase type
[P0] MetricCard > applies metric-change-decrease class for decrease type
[P0] MetricCard > applies metric-change-neutral class for neutral type
[P0] MetricCard > does not render change when change prop omitted
[P0] MetricCard > renders icon when icon prop provided
[P0] MetricCard > applies iconColor style to icon container
[P0] MetricCard > does not render icon when icon prop omitted
[P1] MetricCard > calls onClick when card clicked
[P1] Card > does not call onClick when not provided
[P2] Card > matches snapshot for default props
[P2] MetricCard > matches snapshot with all props
```

### mockData.test.ts (optional data validation)

```
[P2] mockData > mockMetrics has 4 items
[P2] mockData > each metric has required properties
[P2] mockData > chartData.userGrowth has 6 months
[P2] mockData > chartData.revenue has 6 months
[P2] mockData > chartData.projectStatus has 4 statuses
[P2] mockData > mockActivity items have valid ISO timestamps
```

---

## 10. Mocking Guide

Describes what must be mocked in Jest for this module to work in isolation.

### Required Mocks

| What                 | How to mock                                               | Notes                                                                        |
| -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `recharts`           | Manual mock or shallow render                             | Recharts uses canvas/SVG; mock ResponsiveContainer to avoid dimension errors |
| `lucide-react` icons | `jest.mock('lucide-react')` returning simple divs         | Or use actual icons if testing icon rendering                                |
| CSS imports          | `jest.config.js` with `moduleNameMapper` for `.css` files | Map to identity-obj-proxy or empty object                                    |
| `console.log`        | `jest.spyOn(console, 'log').mockImplementation()`         | For testing handleMetricClick logging                                        |
| Date/time formatting | None required (uses native Date methods)                  | Consider freezing time with `jest.useFakeTimers()` for consistent snapshots  |

### Mock Examples

#### Mock Recharts Components

```ts
// __mocks__/recharts.tsx
export const ResponsiveContainer = ({ children }: any) => <div data-testid="responsive-container">{children}</div>
export const LineChart = ({ children, data }: any) => <div data-testid="line-chart" data-data={JSON.stringify(data)}>{children}</div>
export const BarChart = ({ children, data }: any) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>
export const PieChart = ({ children }: any) => <div data-testid="pie-chart">{children}</div>
export const Line = (props: any) => <div data-testid="line" {...props} />
export const Bar = (props: any) => <div data-testid="bar" {...props} />
export const Pie = ({ children, data }: any) => <div data-testid="pie" data-data={JSON.stringify(data)}>{children}</div>
export const Cell = (props: any) => <div data-testid="cell" {...props} />
export const XAxis = (props: any) => <div data-testid="x-axis" {...props} />
export const YAxis = (props: any) => <div data-testid="y-axis" {...props} />
export const CartesianGrid = (props: any) => <div data-testid="cartesian-grid" {...props} />
export const Tooltip = (props: any) => <div data-testid="tooltip" {...props} />
```

#### Mock Lucide Icons (if needed)

```ts
// __mocks__/lucide-react.tsx
export const Users = (props: any) => <div data-testid="icon-users" {...props} />
export const FolderKanban = (props: any) => <div data-testid="icon-folder-kanban" {...props} />
export const DollarSign = (props: any) => <div data-testid="icon-dollar-sign" {...props} />
export const CheckCircle = (props: any) => <div data-testid="icon-check-circle" {...props} />
export const TrendingUp = (props: any) => <div data-testid="icon-trending-up" {...props} />
export const Activity = (props: any) => <div data-testid="icon-activity" {...props} />
```

#### Mock CSS Modules

```js
// jest.config.js
module.exports = {
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
```

### Standard Test Setup

```tsx
// tests/utils/renderWithProviders.tsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";

export function renderWithRouter(ui: ReactElement, { route = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
```

**Note**: AnalyticsDashboard does not consume ThemeContext, so no need to mock it for this component. However, integration tests may need it if testing within full App tree.

---

## 11. Edge Cases & Boundary Conditions

List non-obvious scenarios the test suite should cover:

### Data Edge Cases

- Empty `mockMetrics` array — dashboard should handle gracefully (not current behavior)
- Missing `change` prop in metric — should render without change indicator ✓
- Missing `icon` prop — should render without icon ✓
- `value` as very large number — should not break layout
- `value` as empty string — should render empty space (edge case)
- Negative revenue values — should render correctly (not currently in mock data)

### Chart Edge Cases

- Empty data arrays (userGrowth: [], revenue: [], projectStatus: [])
  - Currently no empty state handling — charts may fail
- Single data point — charts should still render
- Very large numbers — chart scales should adjust
- Missing month labels — XAxis should handle gracefully
- Color prop missing in projectStatus — Pie Cell should have fallback

### Time Range Edge Cases

- Rapid clicking between time range buttons — state should update cleanly ✓
- Currently selected range clicked again — should remain active (no-op) ✓
- Time range state updates but data does not change — verify behavior

### Activity Feed Edge Cases

- `mockActivity` with fewer than 5 items — should render all available
- `mockActivity` empty — should render empty activity list
- Invalid ISO timestamp — date formatting may throw error
- Activity item without timestamp — should handle gracefully
- Very long activity descriptions — should not break layout

### Browser/Rendering Edge Cases

- ResponsiveContainer parent has no dimensions — chart may not render
  - Mock tests avoid this; integration tests in real browser needed
- Print stylesheet — ensure dashboard prints reasonably
- Small viewport (<400px) — grid should reflow (check CSS media queries)

### Interaction Edge Cases

- Clicking MetricCard — `handleMetricClick` called but does nothing (verify console.log)
- Clicking disabled/inactive time range button — should activate it
- Keyboard navigation — buttons should be keyboard accessible (tab, enter)
- Screen reader — chart data should have accessible descriptions (currently lacking)

### Performance Edge Cases

- Very large mockActivity array (1000+ items) — component slices to 5, so safe ✓
- Re-rendering with same props — React should optimize (verify with profiler)
- Rapid state updates — useState batching should handle efficiently

---

## 12. Dependencies & Environment

### Package Versions

From `package.json`:

- **react**: 19.2.5
- **react-dom**: 19.2.5
- **react-router-dom**: 7.14.2
- **recharts**: 3.8.1
- **lucide-react**: 1.8.0
- **TypeScript**: 6.0.2

### Build Tools

- **Vite**: 8.0.9
- **@vitejs/plugin-react**: 6.0.1

### Testing (to be added)

- Recommended: **Jest** 29.x + **React Testing Library** 15.x
- For TypeScript: **ts-jest** or **@swc/jest**
- For mocking: **@testing-library/jest-dom** for extended matchers

### Browser Support

- Modern browsers (ES2020+)
- No IE11 support (React 19 requirement)

### CSS Architecture

- CSS Variables for theming (light/dark mode via ThemeContext)
- No CSS-in-JS libraries
- Global styles + component-scoped stylesheets
- CSS class naming: BEM-inspired (e.g., `dashboard-header`, `metric-card`)

---

## 13. Integration Points

### Parent Components

- **App.tsx** — provides routing via `<Routes>`
- **Layout.tsx** — wraps AnalyticsDashboard, provides navigation sidebar and theme toggle
- **ThemeProvider** — provides theme context (not consumed by AnalyticsDashboard itself)

### Sibling Routes

- `/users` — UserManagement page
- `/projects` — ProjectDashboard page
- `/settings` — SettingsDashboard page
- Navigation via sidebar NavLink components

### Child Components

- **MetricCard** — receives props from AnalyticsDashboard
- **Card** — receives children and styling props
- **Recharts components** — receive data and configuration props

### Future Integration Points (when API added)

- Data fetching hook (e.g., `useAnalytics(timeRange)`)
- Error boundary for chart rendering failures
- Loading skeleton while fetching data
- Real-time updates via WebSocket or polling
- Export/download functionality for charts

---

## 14. Accessibility Considerations

### Current State

- ✓ Semantic HTML structure (headings, lists, buttons)
- ✓ Keyboard navigation for time range buttons
- ✗ No ARIA labels for charts
- ✗ No screen reader descriptions for data visualizations
- ✗ Color-only indicators (change increase/decrease relies solely on color)
- ✗ No focus indicators customized
- ✗ No reduced motion support for animations

### Recommended Improvements

1. Add `aria-label` to chart containers describing the data
2. Add `role="region"` with `aria-labelledby` for each dashboard section
3. Provide text alternatives for chart data (data table or sr-only text)
4. Add `aria-live="polite"` to metrics that update
5. Ensure change indicators have text labels, not just color
6. Add `aria-pressed` to time range buttons
7. Test with screen readers (NVDA, JAWS, VoiceOver)

### Testing Accessibility

```tsx
import { axe } from "jest-axe";

test("AnalyticsDashboard has no accessibility violations", async () => {
  const { container } = render(<AnalyticsDashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 15. Known Limitations & TODOs

### Current Limitations

1. **No data fetching** — all data is static mock data
2. **Time range selector non-functional** — state updates but data doesn't change
3. **No loading states** — instant render assumes data always present
4. **No error handling** — no try/catch, error boundaries, or fallback UI
5. **No empty states** — assumes data is always populated
6. **handleMetricClick is a stub** — only logs to console
7. **No real-time updates** — data is static on page load
8. **Charts lack interactivity** — no drill-down, filtering, or detail views
9. **No data export** — cannot download charts or data
10. **Activity feed shows only 5 items** — no pagination or "view all"

### Future Enhancements (TODOs)

- [ ] Integrate with real analytics API
- [ ] Implement time range filtering with actual data refetch
- [ ] Add loading skeletons for async data
- [ ] Add error boundaries and error states
- [ ] Implement metric click drill-down (navigate to detail pages)
- [ ] Add chart interactivity (tooltips, zoom, filters)
- [ ] Add data export (CSV, PDF, PNG)
- [ ] Pagination or infinite scroll for activity feed
- [ ] Real-time updates via WebSocket
- [ ] Add date range picker (custom range selection)
- [ ] Responsive design optimization for mobile
- [ ] Print-friendly styling
- [ ] Accessibility improvements (see section 14)
- [ ] Add unit tests for all components
- [ ] Add integration tests with real routing
- [ ] Add visual regression tests (screenshots)
- [ ] Performance optimization (React.memo, virtualization for large lists)

---

## 16. Testing Strategy Summary

### Unit Tests (Jest + RTL)

- **Target**: Individual components in isolation
- **Files**: `AnalyticsDashboard.test.tsx`, `Card.test.tsx`
- **Coverage Goal**: 90%+ for component logic
- **Mocks**: Recharts, lucide-react, CSS imports

### Integration Tests

- **Target**: Component interactions with routing
- **Setup**: Render within `<MemoryRouter>` and `<Layout>`
- **Scenarios**: Navigation, theme context, full app tree rendering

### Visual Regression Tests (optional)

- **Tool**: Storybook + Chromatic or Percy
- **Target**: Chart rendering, responsive layouts
- **Scenarios**: Light/dark theme, different viewport sizes

### Accessibility Tests

- **Tool**: jest-axe + manual testing
- **Target**: WCAG AA compliance
- **Scenarios**: Keyboard navigation, screen reader compatibility

### Performance Tests (optional)

- **Tool**: React Profiler, Lighthouse
- **Target**: Render performance, bundle size
- **Metrics**: FCP, LCP, TTI

---

## 17. Quick Reference: Key Test IDs (Recommended)

For easier testing, recommend adding `data-testid` attributes:

```tsx
// Suggested test IDs to add to AnalyticsDashboard.tsx
<div className="dashboard" data-testid="analytics-dashboard">
  <h1 className="dashboard-title" data-testid="dashboard-title">
    ...
  </h1>
  <div className="time-range-selector" data-testid="time-range-selector">
    <button data-testid="time-range-7d">...</button>
    <button data-testid="time-range-30d">...</button>
    <button data-testid="time-range-90d">...</button>
    <button data-testid="time-range-1y">...</button>
  </div>
  <div className="metrics-grid" data-testid="metrics-grid">
    <MetricCard data-testid="metric-total-users" />
    <MetricCard data-testid="metric-active-projects" />
    <MetricCard data-testid="metric-revenue" />
    <MetricCard data-testid="metric-tasks-completed" />
  </div>
  <div className="chart-card" data-testid="user-growth-chart">
    ...
  </div>
  <div className="chart-card" data-testid="revenue-chart">
    ...
  </div>
  <div className="chart-card" data-testid="project-status-chart">
    ...
  </div>
  <div className="activity-list" data-testid="activity-list">
    <div className="activity-item" data-testid="activity-item-1">
      ...
    </div>
  </div>
</div>
```

These test IDs make queries more robust and less coupled to implementation details.

---

## End of Documentation

**Total files analyzed**: 5

- `src/pages/AnalyticsDashboard.tsx` (main)
- `src/components/Card.tsx` (MetricCard, Card)
- `src/data/mockData.ts` (data source)
- `src/pages/Dashboard.css` (styles)
- `src/components/Card.css` (styles)

**Total testable units identified**: 50+ test cases across P0/P1/P2 priorities

**Key gaps**:

- No TypeScript types for chart data props (inferred from recharts library types)
- No API integration (all mock data)
- No error handling or loading states
- Limited accessibility attributes

**Next steps**:

1. Set up Jest + React Testing Library in the project
2. Create `tests/` directory structure mirroring `src/`
3. Implement P0 test cases first (core rendering and data flow)
4. Add mocks for recharts and lucide-react
5. Configure test coverage reporting
6. Implement P1 test cases (user interactions)
7. Consider P2 test cases (edge cases, accessibility)

---

**This document is ready to be passed to a Jest test-generation LLM or engineer.**
Point the LLM at this file and ask it to implement the test plan in Section 9 using the mocking patterns in Section 10 and the testable units in Section 3.
