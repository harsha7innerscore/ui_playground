---
name: module-flow-documenter
description: >
  Use this skill whenever the user wants to document a frontend module, page, route, or component
  for the purpose of generating unit test cases. Triggers include: requests to "document a module",
  "create docs for unit testing", "analyze a component flow", "document the Users module",
  "prepare test documentation", or any mention of documenting a React/Vite module or page before
  writing Jest tests. Also trigger when the user mentions a module name (e.g., "Users", "Dashboard",
  "Auth") alongside words like "document", "test", "jest", or "flow". Always use this skill when the
  goal is to produce structured documentation that another LLM will consume to write Jest unit tests.
---

# Module Flow Documenter

Produces structured, Jest-oriented documentation for a frontend module by locating it in the
codebase, tracing its full component/logic tree, and emitting a documentation format optimized
for unit test generation.

---

## Step 0 — Read the project layout

Before anything else, get a high-level picture of the repo:

```bash
# From the project root
find . -maxdepth 3 \( -name "App.tsx" -o -name "App.jsx" -o -name "App.js" \
  -o -name "main.tsx" -o -name "main.jsx" \) | head -20

ls src/pages src/views src/routes 2>/dev/null || true
```

Identify:
- The router file (usually `App.tsx/jsx` or a dedicated `router.tsx`)
- The pages/views directory (common: `src/pages/`, `src/views/`, `src/routes/`)
- State management entry points (Redux store, Zustand store, React Query client)

---

## Step 1 — Locate the target module

Given a **module name** (e.g., `Users`), search in this priority order:

### 1a. Check App file for route definition
```bash
grep -n -i "users\|<Users\|/users" src/App.tsx src/App.jsx src/App.js \
  src/router.tsx src/router.jsx 2>/dev/null | head -30
```

Look for:
- `<Route path="/users" element={<UsersPage />} />`
- `import UsersPage from './pages/Users'`
- Lazy imports: `const Users = lazy(() => import('./pages/Users'))`

### 1b. Check pages / views folder
```bash
find src/pages src/views src/routes src/features -iname "*user*" 2>/dev/null
```

### 1c. Check feature folders (feature-based architecture)
```bash
find src/features src/modules -maxdepth 3 -iname "*user*" 2>/dev/null
```

**Record the canonical entry file** — this is the root of the module tree you will document.

---

## Step 2 — Trace the full component tree

Starting from the entry file, recursively read every imported local file. Use this bash helper to
list first-degree local imports:

```bash
# Replace FILE with the path to inspect
grep -E "^import .+ from '[./]" FILE | grep -v "node_modules"
```

For each file encountered, extract:
- **Component name** and type (page, layout, container, presentational, hook, util, context)
- **Props interface / TypeScript types**
- **State** (useState, useReducer, Zustand slice, Redux slice)
- **Side effects** (useEffect, useMemo, useCallback — note dependencies)
- **Event handlers** (onClick, onSubmit, onChange, etc.)
- **API calls** (fetch, axios, React Query useQuery/useMutation, RTK Query)
- **Routing** (useNavigate, useParams, useSearchParams, Link, NavLink)
- **Context consumed** (useContext, custom hooks wrapping context)
- **Conditional rendering logic** (loading states, error states, empty states, auth guards)
- **Form logic** (react-hook-form, Formik, controlled inputs)

Build a **component tree** like:

```
UsersPage (src/pages/Users/index.tsx)
├── UserListContainer (src/pages/Users/UserListContainer.tsx)
│   ├── useUsers (src/hooks/useUsers.ts)          ← custom hook
│   ├── UserTable (src/components/UserTable.tsx)
│   │   └── UserRow (src/components/UserRow.tsx)
│   └── Pagination (src/components/Pagination.tsx)
├── UserFilterBar (src/pages/Users/UserFilterBar.tsx)
└── CreateUserModal (src/pages/Users/CreateUserModal.tsx)
    └── UserForm (src/components/UserForm.tsx)
```

---

## Step 3 — Extract testable units

For each node in the tree, identify **what is worth testing** and **how Jest/RTL would approach it**.

Categorize every testable item:

| Category | What to capture |
|---|---|
| **Pure functions / utils** | Input → output, edge cases, error throws |
| **Custom hooks** | Return values, state transitions, side-effect triggers, cleanup |
| **Presentational components** | Renders with props, conditional UI, snapshot candidates |
| **Container components** | Data fetching mocks, loading/error/success states, child interactions |
| **Form components** | Validation rules, submission handler calls, error messages |
| **API layer** | Request params, success/error handling, loading flag transitions |
| **State slices (Redux/Zustand)** | Reducer/action output, selector output |
| **Route behaviour** | Param reading, navigation calls on events |
| **Auth/permission guards** | Redirect when unauthenticated, hidden UI for insufficient roles |

---

## Step 4 — Produce the documentation file

Write a Markdown file called `<ModuleName>-test-docs.md` with the sections below.
Keep every section factual and code-grounded — no speculation.

---

### Document template

```markdown
# <ModuleName> Module — Test Documentation

## 1. Module Overview
- **Entry point**: `src/pages/<ModuleName>/index.tsx`
- **Route**: `/users` (or `N/A` if not routed)
- **Purpose**: One-sentence description of what this module does for the user.
- **Key dependencies**: react-query v5, react-hook-form v7, axios, react-router-dom v6 …

---

## 2. Component Tree

(Paste ASCII tree from Step 2)

---

## 3. File-by-File Breakdown

For each file, emit a sub-section:

### `<relative/path/to/File.tsx>`

**Type**: Page | Container | Presentational | Hook | Util | Context | Slice

**Exported**: `export default UserListContainer` / `export { useUsers }`

**Props / Signature**
```ts
// Paste the actual TypeScript interface or function signature
interface UserListContainerProps {
  initialFilter?: string;
}
```

**State**
- `users: User[]` — fetched list, populated by useUsers hook
- `selectedIds: string[]` — controlled by local useState

**Side Effects**
- `useEffect(() => fetchUsers(filter), [filter])` — refetches when filter changes

**Event Handlers**
- `handleDelete(id: string)` — calls `deleteUser` mutation, then invalidates query cache

**API Interactions**
- GET `/api/users?filter=…` via `useQuery(['users', filter], fetchUsers)`
- DELETE `/api/users/:id` via `useMutation(deleteUser)`

**Conditional Rendering**
- `isLoading` → renders `<Spinner />`
- `isError` → renders `<ErrorBanner message={error.message} />`
- `users.length === 0` → renders `<EmptyState />`

**Routing**
- `useNavigate` called on row click → navigates to `/users/:id`

**Testable Units (this file)**
1. Renders spinner while loading
2. Renders error banner on API failure
3. Renders empty state when list is empty
4. Renders correct number of `<UserRow>` elements
5. Calls deleteUser mutation when delete button clicked
6. Navigates to detail page on row click
7. Refetches when filter prop changes

---

## 4. Custom Hooks Reference

For each custom hook:

### `useUsers(filter: string)`
- **File**: `src/hooks/useUsers.ts`
- **Returns**: `{ users, isLoading, isError, error, refetch }`
- **Behaviour**:
  - Calls React Query `useQuery` with key `['users', filter]`
  - Transforms raw API response through `normalizeUser()`
- **Jest approach**: wrap in `renderHook`; mock `axios.get`; assert return values for
  loading / success / error states.

---

## 5. API Contract Summary

| Method | Endpoint | Trigger | Success shape | Error handling |
|--------|----------|---------|---------------|----------------|
| GET | `/api/users` | component mount / filter change | `{ data: User[], total: number }` | sets isError |
| DELETE | `/api/users/:id` | delete button | `204 No Content` | toast error |
| POST | `/api/users` | form submit | `{ data: User }` | form field errors |

---

## 6. State Management

### Redux / Zustand slice (if present)
- **Slice file**: `src/store/usersSlice.ts`
- **State shape**:
```ts
interface UsersState {
  selectedIds: string[];
  filterDraft: string;
}
```
- **Actions**: `selectUser(id)`, `deselectUser(id)`, `setFilterDraft(value)`
- **Selectors**: `selectSelectedIds`, `selectFilterDraft`
- **Jest approach**: test reducers with plain function calls; test selectors with mock
  RootState objects.

---

## 7. Form Validation Rules

For each form in the module:

### CreateUserForm
- **Library**: react-hook-form
- **Fields and rules**:

| Field | Required | Validation | Error message |
|-------|----------|------------|---------------|
| email | ✅ | isEmail | "Invalid email" |
| name | ✅ | minLength(2) | "Min 2 characters" |
| role | ✅ | oneOf(['admin','viewer']) | "Select a role" |

- **Submit handler**: calls `createUser` mutation; on success closes modal and invalidates
  `['users']` cache.

---

## 8. Permission / Auth Guards

- **Guard HOC / hook**: `useRequireAuth()` — redirects to `/login` if no token
- **Role check**: `<CanAccess role="admin">` wraps the Create button
- **Jest approach**: render with `MemoryRouter`; mock auth context to provide
  unauthenticated state; assert redirect or hidden UI.

---

## 9. Jest Test Plan

A flat, prioritized list of test cases for this module.
Format: `[PRIORITY] FileName > describe block > it description`

**Priority**: P0 = must-have, P1 = high value, P2 = nice-to-have

```
[P0] useUsers.test.ts > useUsers > returns users on successful fetch
[P0] useUsers.test.ts > useUsers > sets isLoading true during request
[P0] useUsers.test.ts > useUsers > sets isError true on network failure
[P0] UserListContainer.test.tsx > UserListContainer > renders Spinner while loading
[P0] UserListContainer.test.tsx > UserListContainer > renders ErrorBanner on error
[P0] UserListContainer.test.tsx > UserListContainer > renders UserRow for each user
[P0] UserListContainer.test.tsx > UserListContainer > calls deleteUser on delete click
[P1] UserListContainer.test.tsx > UserListContainer > navigates to detail on row click
[P1] UserListContainer.test.tsx > UserListContainer > renders EmptyState when list empty
[P1] CreateUserForm.test.tsx > CreateUserForm > shows validation error for invalid email
[P1] CreateUserForm.test.tsx > CreateUserForm > submits form with valid data
[P1] CreateUserForm.test.tsx > CreateUserForm > does not submit when required fields empty
[P1] usersSlice.test.ts > selectUser reducer > adds id to selectedIds
[P1] usersSlice.test.ts > deselectUser reducer > removes id from selectedIds
[P2] UserListContainer.test.tsx > UserListContainer > refetches when filter changes
[P2] UsersPage.test.tsx > UsersPage > redirects unauthenticated user to /login
[P2] UsersPage.test.tsx > UsersPage > hides Create button for non-admin role
```

---

## 10. Mocking Guide

Describes what must be mocked in Jest for this module to work in isolation.

| What | How to mock | Notes |
|------|-------------|-------|
| `axios` / `fetch` | `jest.mock('axios')` + `axios.get.mockResolvedValue(…)` | Use MSW for integration-level |
| React Query | Wrap with `QueryClientProvider` using a fresh `QueryClient` per test | Set `retry: false` |
| React Router | Wrap with `MemoryRouter initialEntries={['/users']}` | Use `createMemoryRouter` for v6 data APIs |
| Auth context | `jest.mock('../contexts/AuthContext')` returning mock user | Provide via `AuthProvider` wrapper |
| `useNavigate` | `const mockNavigate = jest.fn(); jest.mock('react-router-dom', …)` | |
| Date / timers | `jest.useFakeTimers()` | Remember `jest.useRealTimers()` in afterEach |

### Standard test wrapper factory
```ts
// tests/utils/renderWithProviders.tsx
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'], user = mockAuthUser } = {}
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={{ user }}>
        <MemoryRouter initialEntries={initialEntries}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## 11. Edge Cases & Boundary Conditions

List non-obvious scenarios the test suite should cover:

- Empty API response (`data: []`)
- API returns 401 → auth redirect triggered
- User deletes last item on a page → pagination adjusts
- Filter string with special characters (XSS attempt)
- Simultaneous rapid filter changes (debounce behaviour)
- Form submit while mutation is in-flight (button disabled)
- Modal closes on successful create but not on error
```

---

## Step 5 — Output and handoff

1. Save the document to `<project-root>/docs/<ModuleName>-test-docs.md`.
2. Print a short summary to the user:
   - Total files traced
   - Total testable units found
   - Number of P0 test cases
   - Any gaps (e.g., no TypeScript types found, API contract inferred not confirmed)
3. Tell the user: "This document is ready to be passed to a Jest test-generation LLM.
   Point it at `<ModuleName>-test-docs.md` and ask it to implement the test plan in Section 9
   using the mocking patterns in Section 10."

---

## Important rules

- **Never guess** — only document what you can read from source files.
- **Prefer TypeScript types** over prose descriptions wherever available.
- **Quote actual function/variable names** exactly as they appear in the source.
- If a file uses JavaScript (not TypeScript), note this — the test generation LLM needs
  to know not to add type annotations.
- If the module is too large (> 20 files), document only the entry file and direct
  children in full detail; summarize deeper descendants in the component tree only.
- Always note the versions of key libraries found in `package.json` — Jest config,
  Testing Library version, and router version all affect the correct testing patterns.