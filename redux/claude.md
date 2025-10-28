# Redux Application Project Configuration

## Technology Stack
- React 18+
- Redux Toolkit
- Node.js 18.20.4 (compatible with global workspace requirements)

## Project Description
This is a Redux application created with create-react-app and the Redux template. It demonstrates Redux Toolkit usage with a feature-based organization pattern following the specifications provided in `redux-latest/spec.json`.

## Development Workflow

### Setup and Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Architecture

#### Directory Structure
- `src/app/` - Application-wide setup including Redux store configuration
- `src/features/` - Feature-based modules containing:
  - Slice files (state, reducers, actions)
  - Components specific to the feature
  - API integration for the feature
- `src/common/` - Shared components, utilities, and hooks

#### State Management Pattern
- Uses Redux Toolkit for state management
- Feature-based organization with slice pattern
- Follows recommended practices for Redux Toolkit:
  - Slice files contain reducers, actions, and selectors
  - Uses createSlice for reducer and action creation
  - Employs createAsyncThunk for handling asynchronous operations

### Redux Implementation Details
Based on the specification, the application implements:

1. Route-driven data fetching with conditional loading
2. Multiple Redux slices for different data types:
   - subjects
   - chaptersBySubject
   - subchaptersByChapter
   - tasksBySubchapter
   - attemptCountByChapter
   - lastAttemptBySubchapter
3. Caching strategy:
   - Route-aware progressive caching
   - Conditional fetching based on existing data
   - Stale data handling

### Feature Implementation Guide
1. Create a new directory in the `features/` folder
2. Implement the slice file with reducers, actions, and selectors
3. Create UI components that connect to the Redux store
4. Add the reducer to the store configuration

### Code Standards
- Follow functional component patterns with hooks
- Use Redux Toolkit utilities (createSlice, createAsyncThunk)
- Implement proper types for actions, state, and components
- Follow single responsibility principle for components and slices
- Use descriptive naming for actions and state properties

### Testing Strategy
- Unit tests for reducers and selectors
- Integration tests for components with Redux
- End-to-end tests for critical user flows

### Performance Considerations
- Use memoized selectors with createSelector
- Implement proper Redux state normalization
- Follow best practices for preventing unnecessary renders

## Integration Requirements
This project follows the global workspace standards defined in the root CLAUDE.md file, with specific adaptations for Redux application development.