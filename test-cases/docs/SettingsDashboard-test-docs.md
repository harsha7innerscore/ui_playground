# SettingsDashboard Module — Test Documentation

## 1. Module Overview
- **Entry point**: `test-cases/src/pages/SettingsDashboard.tsx`
- **Route**: `/settings` (defined in App.tsx)
- **Purpose**: Comprehensive settings page allowing users to manage account preferences, notifications, privacy, and data across five distinct sections.
- **Key dependencies**: react v19.2.5, react-router-dom v7.14.2, lucide-react v1.8.0, TypeScript v6.0.2

---

## 2. Component Tree

```
SettingsDashboard (src/pages/SettingsDashboard.tsx)
├── useTheme (src/contexts/ThemeContext.tsx)    ← context hook
├── Card (src/components/Card.tsx)              ← reusable component
└── Internal render functions:
    ├── renderGeneralSettings()
    ├── renderProfileSettings()
    ├── renderNotificationSettings() 
    ├── renderPrivacySettings()
    └── renderDataManagement()
```

---

## 3. File-by-File Breakdown

### `src/pages/SettingsDashboard.tsx`

**Type**: Page

**Exported**: `export function SettingsDashboard()`

**Props / Signature**
```ts
// No props - page component
export function SettingsDashboard(): JSX.Element
```

**State**
- `activeSection: string` — controls which settings section is displayed, defaults to 'general'
- `notifications: object` — manages notification preferences
  ```ts
  {
    email: true,
    push: false,
    sms: true,
    desktop: true
  }
  ```
- `privacy: object` — manages privacy settings
  ```ts
  {
    profileVisibility: 'public',
    activityStatus: true,
    analyticsOptIn: false
  }
  ```

**Side Effects**
- No useEffect hooks - all state is local and controlled

**Event Handlers**
- `setActiveSection(id: string)` — switches active settings section
- `handleNotificationToggle(type: keyof typeof notifications)` — toggles notification preferences
- `handlePrivacyToggle(type: keyof typeof privacy)` — toggles privacy settings
- `toggleTheme()` — from useTheme context, toggles light/dark mode

**API Interactions**
- None — this is a pure UI component with no external data fetching

**Conditional Rendering**
- `activeSection` switch statement determines which settings section renders
- Theme icon changes based on `isDark` state (Sun/Moon icons)
- Default case falls back to general settings

**Routing**
- No direct routing logic — component is rendered by React Router at `/settings`

**Context Usage**
- `useTheme()` — consumes theme context for `isDark` and `toggleTheme`

**Testable Units (this file)**
1. Renders correct default section (general) on mount
2. Switches sections when navigation items clicked
3. Renders all 5 navigation items with correct icons and labels
4. Toggles notification settings when checkboxes clicked
5. Toggles privacy settings when controls activated
6. Calls theme toggle when theme button clicked
7. Displays correct theme icon based on isDark state
8. Updates privacy dropdown selection correctly
9. Renders all form inputs with default values in profile section
10. Shows correct usage bar percentage in data management
11. Renders danger zone with delete account button

---

### `src/contexts/ThemeContext.tsx`

**Type**: Context Provider + Hook

**Exported**: `export function useTheme()`, `export function ThemeProvider()`

**Props / Signature**
```ts
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}
```

**State**
- `isDark: boolean` — tracks current theme state

**Side Effects**
- `useEffect(() => {...}, [])` — sets initial theme from system preference and listens for changes
- `useEffect(() => {...}, [isDark])` — applies theme attribute to document.documentElement

**Event Handlers**
- `toggleTheme()` — toggles isDark state
- `handleChange(e: MediaQueryListEvent)` — responds to system theme changes

**API Interactions**
- `window.matchMedia('(prefers-color-scheme: dark)')` — reads system theme preference

**Conditional Rendering**
- Sets `data-theme` attribute on document root based on `isDark`

**Testable Units (this file)**
1. Provides correct initial theme based on system preference
2. Toggles theme state when toggleTheme called
3. Applies correct data-theme attribute to document
4. Listens to system theme changes
5. Throws error when used outside provider
6. Cleans up event listener on unmount

---

### `src/components/Card.tsx`

**Type**: Presentational Component

**Exported**: `export function Card()`, `export function MetricCard()`, `export function UserCard()`, `export function ProjectCard()`

**Props / Signature**
```ts
interface BaseCardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}
```

**State**
- No internal state — purely presentational

**Side Effects**
- None

**Event Handlers**
- `onClick?: () => void` — optional click handler passed as prop

**Conditional Rendering**
- Applies hover and clickable classes based on props
- Combines className prop with base card classes

**Testable Units (this file)**
1. Renders children correctly
2. Applies custom className when provided
3. Applies clickable class when onClick provided
4. Applies hover class by default, excludes when hover={false}
5. Calls onClick when card clicked
6. Renders with correct base card styling

---

## 4. Custom Hooks Reference

### `useTheme()`
- **File**: `src/contexts/ThemeContext.tsx`
- **Returns**: `{ isDark: boolean, toggleTheme: () => void }`
- **Behaviour**:
  - Reads system color scheme preference on mount
  - Listens for system theme changes
  - Applies theme to document root via data-theme attribute
  - Provides toggle function for manual theme switching
- **Jest approach**: wrap in custom render with ThemeProvider; mock window.matchMedia; assert theme state changes and document attribute updates.

---

## 5. API Contract Summary

| Method | Endpoint | Trigger | Success shape | Error handling |
|--------|----------|---------|---------------|----------------|
| N/A | N/A | N/A | N/A | This component has no API interactions |

**Note**: This is a pure UI component with no external data dependencies. All state is local and managed through React hooks.

---

## 6. State Management

### Local useState hooks
- **Component**: SettingsDashboard
- **State shape**:
```ts
interface SettingsState {
  activeSection: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    activityStatus: boolean;
    analyticsOptIn: boolean;
  };
}
```
- **State updates**: Direct setState calls, toggle functions
- **Jest approach**: test initial state values; test state changes through user interactions; verify correct state passed to child components.

### Context State
- **Context**: ThemeContext
- **State shape**: `{ isDark: boolean, toggleTheme: () => void }`
- **Jest approach**: mock context provider; test context value changes; verify consumer components receive correct values.

---

## 7. Form Validation Rules

### Profile Settings Form
- **Library**: Native HTML5 form controls (no form library used)
- **Fields and validation**:

| Field | Required | Validation | Error message |
|-------|----------|------------|---------------|
| firstName | No | None | N/A |
| lastName | No | None | N/A |
| email | No | type="email" | Browser default |
| jobTitle | No | None | N/A |
| bio | No | None | N/A |

**Note**: Form currently has no custom validation logic or submission handler — this is a mock UI with default values only.

---

## 8. Permission / Auth Guards

- **Guard logic**: None implemented — component assumes authenticated user
- **Role checks**: None — all settings accessible to any authenticated user
- **Jest approach**: N/A for this component, but integration tests should verify authentication requirement at route level.

---

## 9. Jest Test Plan

A flat, prioritized list of test cases for this module.
Format: `[PRIORITY] FileName > describe block > it description`

**Priority**: P0 = must-have, P1 = high value, P2 = nice-to-have

```
[P0] SettingsDashboard.test.tsx > SettingsDashboard > renders with default general section active
[P0] SettingsDashboard.test.tsx > SettingsDashboard > displays all 5 navigation sections
[P0] SettingsDashboard.test.tsx > SettingsDashboard > switches sections when navigation clicked
[P0] SettingsDashboard.test.tsx > SettingsDashboard > toggles notification settings correctly
[P0] SettingsDashboard.test.tsx > SettingsDashboard > toggles privacy settings correctly
[P0] SettingsDashboard.test.tsx > SettingsDashboard > calls toggleTheme when theme button clicked
[P1] SettingsDashboard.test.tsx > SettingsDashboard > displays correct theme icon based on isDark
[P1] SettingsDashboard.test.tsx > SettingsDashboard > updates privacy dropdown selection
[P1] SettingsDashboard.test.tsx > SettingsDashboard > renders profile form with default values
[P1] SettingsDashboard.test.tsx > SettingsDashboard > shows active navigation item styling
[P1] SettingsDashboard.test.tsx > SettingsDashboard > renders data usage bar with correct percentage
[P1] useTheme.test.tsx > useTheme > provides initial theme from system preference
[P1] useTheme.test.tsx > useTheme > toggles theme state when toggleTheme called
[P1] useTheme.test.tsx > useTheme > applies data-theme attribute to document
[P1] useTheme.test.tsx > useTheme > throws error when used outside provider
[P1] ThemeProvider.test.tsx > ThemeProvider > listens to system theme changes
[P1] ThemeProvider.test.tsx > ThemeProvider > cleans up event listeners on unmount
[P1] Card.test.tsx > Card > renders children correctly
[P1] Card.test.tsx > Card > applies custom className when provided
[P1] Card.test.tsx > Card > calls onClick when clicked and onClick provided
[P2] SettingsDashboard.test.tsx > SettingsDashboard > renders all notification toggle switches
[P2] SettingsDashboard.test.tsx > SettingsDashboard > renders all privacy controls
[P2] SettingsDashboard.test.tsx > SettingsDashboard > displays correct section titles
[P2] SettingsDashboard.test.tsx > SettingsDashboard > renders danger zone styling for delete account
[P2] Card.test.tsx > Card > applies hover class by default
[P2] Card.test.tsx > Card > excludes hover class when hover={false}
[P2] Card.test.tsx > Card > applies clickable class when onClick provided
```

---

## 10. Mocking Guide

Describes what must be mocked in Jest for this module to work in isolation.

| What | How to mock | Notes |
|------|-------------|-------|
| `useTheme` | `jest.mock('../contexts/ThemeContext')` returning mock values | Return `{ isDark: false, toggleTheme: jest.fn() }` |
| `window.matchMedia` | Mock with `Object.defineProperty(window, 'matchMedia', {...})` | Required for ThemeContext tests |
| `document.documentElement` | Use jsdom default or mock `setAttribute` | For testing theme application |
| Lucide React icons | Mock as simple divs: `jest.mock('lucide-react', () => ({ Settings: 'div', ... }))` | Prevents icon rendering issues |
| CSS imports | Use `identity-obj-proxy` in Jest config | Already configured in package.json |

### Standard test wrapper factory
```ts
// tests/utils/renderWithProviders.tsx
export function renderWithProviders(
  ui: ReactElement,
  { isDark = false, toggleTheme = jest.fn() } = {}
) {
  return render(
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {ui}
    </ThemeContext.Provider>
  );
}
```

### Mock for window.matchMedia
```ts
// tests/setup.ts or individual test files
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

---

## 11. Edge Cases & Boundary Conditions

List non-obvious scenarios the test suite should cover:

- **Invalid activeSection state**: Component should fallback to general settings when activeSection is not in sections array
- **Rapid section switching**: Multiple quick clicks on navigation should not cause state conflicts
- **Theme toggle during render**: Theme changes while component is rendering should not cause issues
- **Missing ThemeContext**: Component should handle gracefully when theme context is unavailable (though useTheme will throw)
- **System theme change while app open**: Should respond correctly to OS-level theme changes
- **Notification state persistence**: Settings changes should maintain state during section switches
- **Privacy dropdown edge values**: Should handle unexpected values in privacy.profileVisibility
- **Long form input values**: Profile inputs should handle very long text without breaking layout
- **Accessibility**: All toggle switches should be keyboard accessible and screen reader friendly
- **CSS class combinations**: Card component should handle multiple className combinations correctly