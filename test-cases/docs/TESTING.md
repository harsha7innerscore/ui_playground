# Testing Documentation

## Overview

This project uses Jest and React Testing Library for unit testing React components. All tests are written in TypeScript and follow best practices for testing React applications.

## Test Setup

### Installed Dependencies

```json
{
  "devDependencies": {
    "jest": "^30.3.0",
    "@types/jest": "^30.0.0",
    "@testing-library/react": "^16.3.2",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.6.1",
    "jest-environment-jsdom": "^30.3.0",
    "identity-obj-proxy": "^3.0.0",
    "ts-jest": "^10.9.2",
    "@jest/globals": "latest"
  }
}
```

### Configuration Files

#### `jest.config.ts`

- **Preset**: `ts-jest` for TypeScript support
- **Test Environment**: `jsdom` for DOM testing
- **Module Mapping**: CSS files mapped to `identity-obj-proxy`
- **Coverage Thresholds**: 80% for branches, functions, lines, and statements
- **Custom tsconfig** with Jest types included

#### `src/setupTests.ts`

- Imports `@testing-library/jest-dom` for extended matchers
- Mocks console methods to reduce test noise

### Mock Files

#### `src/__mocks__/recharts.tsx`

Mocks all Recharts components to avoid canvas/SVG rendering issues in tests:

- ResponsiveContainer, LineChart, BarChart, PieChart
- Line, Bar, Pie, Cell
- XAxis, YAxis, CartesianGrid, Tooltip

#### `src/__mocks__/lucide-react.tsx`

Mocks Lucide React icons with simple div elements for testing:

- Users, FolderKanban, DollarSign, CheckCircle
- TrendingUp, Activity, BarChart3, Settings
- Moon, Sun

#### `src/__mocks__/fileMock.ts`

Simple mock for image file imports

### Test Utilities

#### `src/tests/utils/renderWithProviders.tsx`

Custom render function that wraps components with necessary providers:

- `MemoryRouter` for routing context
- Configurable initial routes
- Re-exports all React Testing Library utilities

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

Current coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Structure

### Component Tests

#### `src/components/Card.test.tsx`

Tests for Card and MetricCard components:

- ✓ Basic rendering (children, className, hover states)
- ✓ Click handling and event propagation
- ✓ Icon rendering and styling
- ✓ Change indicators (increase/decrease/neutral)
- ✓ Snapshot tests

**Total Tests**: 21 tests

#### `src/pages/AnalyticsDashboard.test.tsx`

Comprehensive tests for the AnalyticsDashboard page:

**Test Suites**:

1. **Header and Title** (2 tests)
   - Dashboard title and subtitle rendering

2. **Time Range Selector** (4 tests)
   - Button rendering and active states
   - Click interactions and state updates

3. **Metric Cards** (8 tests)
   - Rendering all 4 metric cards
   - Correct data display
   - Icon mapping
   - Change indicators
   - Click handlers

4. **Charts Section** (6 tests)
   - Chart component rendering (LineChart, BarChart, PieChart)
   - Data passing to charts
   - Chart titles and icons
   - PieChart cell colors

5. **Recent Activity** (3 tests)
   - Activity items rendering
   - Title and description display
   - Timestamp formatting

6. **Responsive Container** (1 test)
   - Chart containers rendering

7. **CSS Classes and Layout** (2 tests)
   - CSS class application
   - Layout structure

8. **Edge Cases** (2 tests)
   - Rapid button clicks
   - Re-clicking selected button

9. **Chart Components** (4 tests)
   - Chart child components (grids, axes, tooltips)
   - DataKey properties

10. **Integration with mockData** (3 tests)
    - Data source validation
    - Mock data rendering

11. **Snapshot tests** (1 test)
    - Complete dashboard snapshot

**Total Tests**: 41 tests

### Overall Test Statistics

- **Total Test Suites**: 2
- **Total Tests**: 62 (all passing ✓)
- **Total Snapshots**: 3 (all passing ✓)
- **Execution Time**: ~2-3 seconds

## Writing New Tests

### Best Practices

1. **Use Testing Library queries in priority order**:
   - `getByRole` (preferred for accessibility)
   - `getByLabelText`
   - `getByText`
   - `getByTestId` (last resort)

2. **Handle multiple elements**:
   - Use `getAllBy*` when elements appear multiple times
   - Example: Icons used in both metrics and charts

3. **Mock external dependencies**:
   - Always mock chart libraries (recharts)
   - Mock icon libraries to avoid SVG rendering
   - Mock API calls and external services

4. **Test user interactions**:
   - Use `@testing-library/user-event` for realistic user interactions
   - Always `await` user actions

5. **Organize tests with describe blocks**:
   - Group related tests logically
   - Use clear, descriptive test names

### Example Test

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<MyComponent onClick={handleClick} />)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Troubleshooting

### Common Issues

1. **TypeScript errors for Jest globals**
   - Ensure `types: ["jest", "@testing-library/jest-dom"]` is in jest.config.ts

2. **CSS import errors**
   - CSS files are mocked via `identity-obj-proxy`
   - Check `moduleNameMapper` in jest.config.ts

3. **Multiple element errors**
   - Use `getAllByTestId` instead of `getByTestId` when elements appear multiple times
   - Example: `icon-folder-kanban` appears in both metrics and charts

4. **Chart rendering errors**
   - Recharts components are mocked in `__mocks__/recharts.tsx`
   - Verify mocks match the actual recharts API

5. **Console warnings/errors**
   - Console methods are mocked in setupTests.ts
   - Use `jest.spyOn(console, 'log')` if you need to test console output

## Future Improvements

- [ ] Add integration tests with full app rendering
- [ ] Add visual regression tests (Storybook + Chromatic)
- [ ] Add accessibility tests (jest-axe)
- [ ] Add performance tests (React Profiler)
- [ ] Increase coverage to 90%+
- [ ] Add E2E tests with Playwright

## References

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [AnalyticsDashboard Test Documentation](./AnalyticsDashboard-test-docs.md)
