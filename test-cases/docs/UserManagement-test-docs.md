# UserManagement Module — Test Documentation

## 1. Module Overview
- **Entry point**: `src/pages/UserManagement.tsx`
- **Route**: `/users`
- **Purpose**: User management interface for viewing, filtering, searching, and managing team members with their roles and statuses.
- **Key dependencies**: react v19.2.5, react-router-dom v7.14.2, lucide-react v1.8.0, jest v30.3.0, @testing-library/react v16.3.2

---

## 2. Component Tree

```
UserManagement (src/pages/UserManagement.tsx)
├── Card (src/components/Card.tsx)                    ← base card wrapper
├── UserCard (src/components/Card.tsx)                ← user display component
├── mockUsers (src/data/mockData.ts)                  ← data source
├── Icons (lucide-react)                              ← Search, Plus, Filter, Users, UserCheck, UserX, Clock
└── CSS (src/pages/Dashboard.css)                     ← styling
```

---

## 3. File-by-File Breakdown

### `src/pages/UserManagement.tsx`

**Type**: Page

**Exported**: `export function UserManagement()`

**Props / Signature**
```ts
// No props - top-level page component
export function UserManagement(): JSX.Element
```

**State**
- `searchTerm: string` — controlled by useState, filters users by name/email
- `selectedRole: string` — controlled by useState, filters by role ('all' or specific role)
- `selectedStatus: string` — controlled by useState, filters by status ('all', 'active', 'inactive', 'pending')
- `showAddUserModal: boolean` — controlled by useState, shows/hides add user modal

**Side Effects**
- No useEffect hooks - component is purely reactive to state changes

**Event Handlers**
- `handleEditUser(userId: string)` — logs editing action (placeholder implementation)
- `handleDeleteUser(userId: string)` — logs deletion action (placeholder implementation)
- `setSearchTerm` onChange for search input
- `setSelectedRole` onChange for role filter select
- `setSelectedStatus` onChange for status filter select
- `setShowAddUserModal` onClick for add user buttons and modal overlay

**API Interactions**
- Uses static mock data from `mockUsers` - no actual API calls

**Conditional Rendering**
- `filteredUsers.length > 0` → renders UserCard list
- `filteredUsers.length === 0` → renders empty state with "No users found"
- `showAddUserModal` → renders modal overlay

**Routing**
- No routing logic within component - is a route target at `/users`

**Testable Units (this file)**
1. Renders correct number of stat cards with calculated values
2. Filters users correctly based on search term (name and email)
3. Filters users correctly based on selected role
4. Filters users correctly based on selected status
5. Combines multiple filters correctly
6. Shows empty state when no users match filters
7. Opens modal when "Add User" buttons are clicked
8. Closes modal when overlay or cancel button is clicked
9. Calls handleEditUser with correct userId when UserCard edit is triggered
10. Calls handleDeleteUser with correct userId when UserCard delete is triggered
11. Calculates and displays correct user statistics

---

### `src/components/Card.tsx`

**Type**: Presentational

**Exported**: `export function Card`, `export function UserCard`, `export function MetricCard`, `export function ProjectCard`

**Props / Signature**
```ts
interface BaseCardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  hover?: boolean
}

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    status: 'active' | 'inactive' | 'pending'
  }
  onEdit?: (userId: string) => void
  onDelete?: (userId: string) => void
}
```

**State**
- No internal state - pure presentational components

**Side Effects**
- No side effects

**Event Handlers**
- `onClick` callback for Card component
- `onEdit(user.id)` when Edit button clicked in UserCard
- `onDelete(user.id)` when Remove button clicked in UserCard

**API Interactions**
- None - purely presentational

**Conditional Rendering**
- UserCard: shows avatar image or placeholder initials
- UserCard: shows Edit button only if onEdit prop provided
- UserCard: shows Remove button only if onDelete prop provided

**Testable Units (this file)**
1. Card renders children and applies correct CSS classes
2. Card calls onClick when clicked (if provided)
3. UserCard displays user information correctly
4. UserCard shows avatar image when provided
5. UserCard shows initials placeholder when no avatar
6. UserCard renders status badge with correct styling
7. UserCard calls onEdit with correct userId when edit button clicked
8. UserCard calls onDelete with correct userId when remove button clicked
9. UserCard conditionally renders action buttons based on props

---

### `src/data/mockData.ts`

**Type**: Data/Types

**Exported**: `export const mockUsers: User[]`, `export interface User`

**Props / Signature**
```ts
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

export const mockUsers: User[]
```

**State**
- Static data export - no state

**Side Effects**
- No side effects

**Event Handlers**
- No event handlers

**API Interactions**
- No API calls - static mock data

**Conditional Rendering**
- Not applicable

**Testable Units (this file)**
1. mockUsers array contains expected number of users
2. Each user object has required properties
3. User status values are valid enum values
4. User data types match interface definitions

---

## 4. Custom Hooks Reference

No custom hooks are used in this module. All functionality uses built-in React hooks (useState).

---

## 5. API Contract Summary

| Method | Endpoint | Trigger | Success shape | Error handling |
|--------|----------|---------|---------------|----------------|
| N/A | Static mock data | Component mount | `User[]` from mockUsers | No error handling needed |

**Note**: This module currently uses static mock data. Future API integration would likely involve:
- GET `/api/users` for fetching users
- PUT `/api/users/:id` for editing users  
- DELETE `/api/users/:id` for deleting users
- POST `/api/users` for creating users

---

## 6. State Management

### Local Component State (useState)
- **State shape**:
```ts
interface UserManagementState {
  searchTerm: string;
  selectedRole: string;
  selectedStatus: string;  
  showAddUserModal: boolean;
}
```
- **State updates**: Direct useState setters for each state variable
- **Jest approach**: test state transitions via user interactions; assert DOM changes reflect state updates

---

## 7. Form Validation Rules

### Search Input
- **Library**: Native HTML input (no form library)
- **Validation**: No validation - accepts any text input
- **Jest approach**: test that search term updates component state and filters results

### Filter Selects  
- **Library**: Native HTML select elements
- **Validation**: Constrained to predefined options
- **Options**:

| Filter | Options |
|--------|---------|
| Role | 'all', 'administrator', 'project manager', 'developer', 'designer', 'qa engineer' |
| Status | 'all', 'active', 'inactive', 'pending' |

### Add User Modal
- **Current implementation**: Placeholder with no actual form
- **Jest approach**: test modal visibility and close functionality only

---

## 8. Permission / Auth Guards

- **No authentication/authorization implemented** in this module
- Component renders same interface for all users
- **Future considerations**: Role-based UI hiding, permission checks for edit/delete actions
- **Jest approach**: When auth is added, test with different user roles and permission levels

---

## 9. Jest Test Plan

A flat, prioritized list of test cases for this module.
Format: `[PRIORITY] FileName > describe block > it description`

**Priority**: P0 = must-have, P1 = high value, P2 = nice-to-have

```
[P0] UserManagement.test.tsx > UserManagement > renders all stat cards with correct values
[P0] UserManagement.test.tsx > UserManagement > renders all users when no filters applied
[P0] UserManagement.test.tsx > UserManagement > filters users by search term (name)
[P0] UserManagement.test.tsx > UserManagement > filters users by search term (email)
[P0] UserManagement.test.tsx > UserManagement > filters users by role selection
[P0] UserManagement.test.tsx > UserManagement > filters users by status selection
[P0] UserManagement.test.tsx > UserManagement > combines search and filter criteria
[P0] UserManagement.test.tsx > UserManagement > shows empty state when no users match filters
[P0] UserManagement.test.tsx > UserManagement > opens modal when header add user button clicked
[P0] UserManagement.test.tsx > UserManagement > opens modal when empty state add user button clicked
[P0] UserManagement.test.tsx > UserManagement > closes modal when overlay clicked
[P0] UserManagement.test.tsx > UserManagement > closes modal when cancel button clicked
[P1] UserManagement.test.tsx > UserManagement > calls handleEditUser with correct userId
[P1] UserManagement.test.tsx > UserManagement > calls handleDeleteUser with correct userId
[P1] UserManagement.test.tsx > UserManagement > calculates total users stat correctly
[P1] UserManagement.test.tsx > UserManagement > calculates active users stat correctly
[P1] UserManagement.test.tsx > UserManagement > calculates inactive users stat correctly
[P1] UserManagement.test.tsx > UserManagement > calculates pending users stat correctly
[P1] UserCard.test.tsx > UserCard > renders user information correctly
[P1] UserCard.test.tsx > UserCard > displays avatar image when provided
[P1] UserCard.test.tsx > UserCard > displays initials when no avatar
[P1] UserCard.test.tsx > UserCard > renders status badge with correct styling
[P1] UserCard.test.tsx > UserCard > calls onEdit when edit button clicked
[P1] UserCard.test.tsx > UserCard > calls onDelete when remove button clicked
[P1] UserCard.test.tsx > UserCard > hides edit button when onEdit not provided
[P1] UserCard.test.tsx > UserCard > hides remove button when onDelete not provided
[P2] UserManagement.test.tsx > UserManagement > search is case insensitive
[P2] UserManagement.test.tsx > UserManagement > role filter displays formatted option text
[P2] UserManagement.test.tsx > UserManagement > status filter displays formatted option text
[P2] UserManagement.test.tsx > UserManagement > prevents modal close when modal content clicked
[P2] Card.test.tsx > Card > renders children correctly
[P2] Card.test.tsx > Card > applies custom className
[P2] Card.test.tsx > Card > calls onClick when clicked
[P2] Card.test.tsx > Card > applies hover styles when hover=true
[P2] mockData.test.ts > mockUsers > contains expected number of users
[P2] mockData.test.ts > mockUsers > all users have required properties
[P2] mockData.test.ts > mockUsers > all status values are valid
```

---

## 10. Mocking Guide

Describes what must be mocked in Jest for this module to work in isolation.

| What | How to mock | Notes |
|------|-------------|-------|
| React Router | Wrap with `MemoryRouter initialEntries={['/users']}` | UserManagement is a route target |
| Theme Context | Mock `useTheme` hook or wrap with `ThemeProvider` | Layout component uses theme context |
| mockData import | `jest.mock('../data/mockData')` if testing data isolation | Usually not needed - use real mock data |
| lucide-react icons | `jest.mock('lucide-react', () => ({ IconName: 'IconName' }))` | Simplify icon rendering |
| CSS imports | Use `identity-obj-proxy` in jest config | Already configured |

### Standard test wrapper factory
```ts
// tests/utils/renderWithProviders.tsx
import { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/contexts/ThemeContext'

export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/users'] } = {}
) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </ThemeProvider>
  )
}
```

### Mock implementations
```ts
// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: ({ size, className }: any) => <div data-testid="search-icon" className={className} />,
  Plus: ({ size, className }: any) => <div data-testid="plus-icon" className={className} />,
  Filter: ({ size, className }: any) => <div data-testid="filter-icon" className={className} />,
  Users: ({ size, className }: any) => <div data-testid="users-icon" className={className} />,
  UserCheck: ({ size, className }: any) => <div data-testid="user-check-icon" className={className} />,
  UserX: ({ size, className }: any) => <div data-testid="user-x-icon" className={className} />,
  Clock: ({ size, className }: any) => <div data-testid="clock-icon" className={className} />,
}))
```

---

## 11. Edge Cases & Boundary Conditions

List non-obvious scenarios the test suite should cover:

- **Empty search results**: Search term that matches no users
- **Search edge cases**: Empty string, single character, special characters, very long strings
- **Filter combinations**: All filters applied simultaneously, conflicting filter combinations
- **Data edge cases**: Empty mockUsers array, users with missing optional fields
- **Modal interaction**: Rapid clicking between open/close actions
- **Role/status formatting**: Role names with spaces and capitalization handling
- **User data variations**: Users without avatars, users with very long names/emails
- **Statistics accuracy**: Ensure stats always match filtered/unfiltered user counts
- **Button state management**: Modal buttons work correctly after multiple open/close cycles
- **Case sensitivity**: Search works correctly across different text cases
- **Whitespace handling**: Search and filter inputs handle leading/trailing whitespace