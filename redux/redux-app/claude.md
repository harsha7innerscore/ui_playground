# Redux App - Project Configuration

## Technology Stack
- **React**: v18.2.0
- **Redux**: Using Redux Toolkit (v1.9.5)
- **React Redux**: v8.1.0
- **Node.js**: 18.20.4 (compatible with Node.js 18.x)

## Project Structure
- **app/**: Contains Redux store configuration
- **features/**: Contains Redux slices, organized by feature
  - **counter/**: Example feature with slice, component, and API
- **components/**: Reusable React components

## Development Workflow

### Commands
- `npm start`: Run development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run eject`: Eject from create-react-app

### Redux Best Practices
- Use Redux Toolkit for all Redux code
- Create slices for each feature domain
- Use createAsyncThunk for async operations
- Leverage Redux DevTools for debugging

### Component Guidelines
- Use functional components with hooks
- Use useSelector for accessing Redux state
- Use useDispatch for dispatching actions
- Keep components focused on rendering, delegate business logic to slices

### Testing
- Test Redux reducers and selectors
- Test React components using React Testing Library
- Write integration tests to verify Redux and React working together

### Code Quality
- Follow Airbnb React/JSX Style Guide
- Keep components small and focused
- Maintain proper PropTypes or TypeScript types
- Document complex logic with comments

### Performance Considerations
- Use memoization for expensive selectors (createSelector)
- Avoid unnecessary re-renders by proper use of useSelector
- Only subscribe to the state that a component needs

## Design Patterns
- Feature-first organization
- Duck pattern for Redux modules
- Container/Presentational pattern for components (optional)

## Accessibility
- Ensure all UI elements have proper ARIA attributes
- Maintain keyboard navigation support
- Use semantic HTML elements

## Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support