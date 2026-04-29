# SettingsDashboard Module — Test Documentation

## 1. Module Overview
- **Entry point**: `src/pages/SettingsDashboard.tsx`
- **Route**: `/settings`
- **Purpose**: User account settings management with sections for general, profile, notifications, privacy, and data management.
- **Key dependencies**: react v19.2.5, react-router-dom v7.14.2, lucide-react v1.8.0, custom ThemeContext, Card component

---

## 2. Component Tree

```
SettingsDashboard (src/pages/SettingsDashboard.tsx)
├── useTheme (src/contexts/ThemeContext.tsx)          ← context hook
├── Card (src/components/Card.tsx)                    ← reusable UI component
└── Lucide Icons (lucide-react)                       ← external library
```

---

## 3. File-by-File Breakdown

### `src/pages/SettingsDashboard.tsx`

**Type**: Page

**Exported**: `export function SettingsDashboard`

**Props / Signature**
```ts
// No props - standalone page component
export function SettingsDashboard(): JSX.Element
```

**State**
- `activeSection: string` — current active settings section, default 'general'
- `notifications: object` — notification preferences with boolean flags for email/push/sms/desktop
- `privacy: object` — privacy settings including profileVisibility string and boolean flags

**Side Effects**
- `useTheme()` — consumes theme context for dark/light mode toggle

**Event Handlers**
- `handleNotificationToggle(type: keyof typeof notifications)` — toggles notification preference
- `handlePrivacyToggle(type: keyof typeof privacy)` — toggles privacy setting boolean values
- `toggleTheme()` — from ThemeContext, toggles theme mode
- `setActiveSection(id: string)` — switches between settings sections

**API Interactions**
- None — all settings are local state only

**Conditional Rendering**
- Navigation sections render based on `sections` array
- Content area renders different components based on `activeSection` value
- Theme icon switches between Sun/Moon based on `isDark` state

**Routing**
- No internal routing — displays different content sections via conditional rendering

**Testable Units (this file)**
1. Renders settings navigation with all 5 sections
2. Shows correct active section highlight based on activeSection state
3. Switches content when navigation item clicked
4. Toggles theme when theme button clicked
5. Updates notification preferences when toggles changed
6. Updates privacy settings when toggles/selects changed
7. Renders correct theme icon based on isDark state
8. Shows default general settings section on mount

---

### `src/contexts/ThemeContext.tsx`

**Type**: Context

**Exported**: `export function useTheme`, `export function ThemeProvider`

**Props / Signature**
```ts
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

function useTheme(): ThemeContextType
function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element
```

**State**
- `isDark: boolean` — current theme mode, initialized from system preference

**Side Effects**
- `useEffect(() => {}, [])` — sets up system theme preference detection on mount
- `useEffect(() => {}, [isDark])` — applies theme attribute to document.documentElement

**Event Handlers**
- `toggleTheme()` — flips isDark boolean state

**Testable Units (this file)**
1. Initializes with system dark mode preference
2. Updates document data-theme attribute when isDark changes
3. toggleTheme flips isDark state
4. Throws error when useTheme called outside provider

---

### `src/components/Card.tsx`

**Type**: Presentational

**Exported**: `export function Card`, `export function MetricCard`, `export function UserCard`, `export function ProjectCard`

**Props / Signature**
```ts
interface BaseCardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}
```

**Testable Units (this file)**
1. Renders children content inside card wrapper
2. Applies custom className when provided
3. Applies hover styles when hover=true (default)
4. Calls onClick handler when clicked and handler provided
5. Applies clickable styles when onClick provided

---

## 4. Custom Hooks Reference

### `useTheme()`
- **File**: `src/contexts/ThemeContext.tsx`
- **Returns**: `{ isDark: boolean, toggleTheme: () => void }`
- **Behaviour**:
  - Consumes ThemeContext value
  - Throws error if used outside ThemeProvider
- **Jest approach**: wrap component in ThemeProvider; mock context value; assert toggleTheme calls and isDark value changes.

---

## 5. API Contract Summary

| Method | Endpoint | Trigger | Success shape | Error handling |
|--------|----------|---------|---------------|----------------|
| N/A | N/A | N/A | N/A | N/A |

*No API calls in this module — all settings are local state only.*

---

## 6. State Management

### Local Component State
- **State shape**:
```ts
interface SettingsState {
  activeSection: string;                    // 'general' | 'profile' | 'notifications' | 'privacy' | 'data'
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  privacy: {
    profileVisibility: string;              // 'public' | 'team' | 'private'
    activityStatus: boolean;
    analyticsOptIn: boolean;
  };
}
```
- **State updates**: all via useState setters, no reducers
- **Jest approach**: test initial state values; simulate user interactions and assert state changes via rendered UI updates.

---

## 7. Form Validation Rules

### Profile Settings Form
- **Library**: native HTML form inputs (no form library)
- **Fields and rules**:

| Field | Required | Validation | Error message |
|-------|----------|------------|---------------|
| firstName | ❌ | none | none |
| lastName | ❌ | none | none |
| email | ❌ | none | none |
| jobTitle | ❌ | none | none |
| bio | ❌ | none | none |

*No validation implemented — form uses defaultValue props only.*

---

## 8. Permission / Auth Guards

- **Guard HOC / hook**: None present
- **Role check**: None present
- **Jest approach**: N/A — no auth guards in this module.

---

## 9. Jest Test Plan

A flat, prioritized list of test cases for this module.
Format: `[PRIORITY] FileName > describe block > it description`

**Priority**: P0 = must-have, P1 = high value, P2 = nice-to-have

```
[P0] SettingsDashboard.test.tsx > SettingsDashboard > renders settings navigation with all sections
[P0] SettingsDashboard.test.tsx > SettingsDashboard > renders general settings by default
[P0] SettingsDashboard.test.tsx > SettingsDashboard > switches to correct section when nav item clicked
[P0] SettingsDashboard.test.tsx > SettingsDashboard > highlights active section in navigation
[P0] SettingsDashboard.test.tsx > SettingsDashboard > toggles theme when theme button clicked
[P0] SettingsDashboard.test.tsx > SettingsDashboard > shows correct theme icon based on theme state
[P0] SettingsDashboard.test.tsx > SettingsDashboard > toggles notification settings when switches clicked
[P0] SettingsDashboard.test.tsx > SettingsDashboard > updates privacy settings when controls changed
[P1] SettingsDashboard.test.tsx > SettingsDashboard > renders all notification toggle switches
[P1] SettingsDashboard.test.tsx > SettingsDashboard > renders all privacy setting controls
[P1] SettingsDashboard.test.tsx > SettingsDashboard > renders profile form with default values
[P1] SettingsDashboard.test.tsx > SettingsDashboard > renders data management section with actions
[P1] ThemeContext.test.tsx > useTheme > returns theme state from context
[P1] ThemeContext.test.tsx > useTheme > throws error when used outside provider
[P1] ThemeContext.test.tsx > ThemeProvider > initializes with system preference
[P1] ThemeContext.test.tsx > ThemeProvider > toggles theme state correctly
[P1] ThemeContext.test.tsx > ThemeProvider > updates document attribute on theme change
[P2] Card.test.tsx > Card > renders children content
[P2] Card.test.tsx > Card > applies custom className
[P2] Card.test.tsx > Card > calls onClick when clicked
[P2] Card.test.tsx > Card > applies hover styles by default
[P2] SettingsDashboard.test.tsx > SettingsDashboard > renders correct section icons
[P2] SettingsDashboard.test.tsx > SettingsDashboard > maintains state when switching sections
```

---

## 10. Mocking Guide

Describes what must be mocked in Jest for this module to work in isolation.

| What | How to mock | Notes |
|------|-------------|-------|
| ThemeContext | Wrap with `ThemeProvider` or mock `useTheme` hook | Provide mock `{ isDark: false, toggleTheme: jest.fn() }` |
| CSS imports | `jest.mock('./Dashboard.css', () => ({}))` | Use identity-obj-proxy in jest config |
| Lucide icons | Mock as simple div components | `jest.mock('lucide-react', () => ({ Settings: () => <div>Settings</div> }))` |

### Standard test wrapper factory
```tsx
// tests/utils/renderWithProviders.tsx
export function renderWithProviders(
  ui: ReactElement,
  { themeValue = { isDark: false, toggleTheme: jest.fn() } } = {}
) {
  return render(
    <ThemeContext.Provider value={themeValue}>
      {ui}
    </ThemeContext.Provider>
  );
}
```

---

## 11. Edge Cases & Boundary Conditions

List non-obvious scenarios the test suite should cover:

- All notification toggles start with correct initial values (email: true, push: false, sms: true, desktop: true)
- Privacy settings initialize correctly (profileVisibility: 'public', activityStatus: true, analyticsOptIn: false)
- Theme toggle works when context isDark is true vs false
- Section navigation preserves local state when switching between sections
- Form inputs show default values and remain uncontrolled
- Component renders without errors when ThemeContext provides different values
- Icon rendering handles both light/dark theme states for theme toggle button
- Settings sections array maps correctly to navigation items
- Active section state controls both navigation highlight and content rendering
- Profile visibility select dropdown shows all three options and handles changes
- Data usage bar shows hardcoded 45% width and usage text