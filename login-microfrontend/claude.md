# Login Microfrontend

A React + TypeScript + Vite microfrontend application with Tailwind CSS for styling, focused on authentication and login functionality.

## Technology Stack
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 5.4.2 (compatible with Node 18.20.4)
- **UI/Styling**: Tailwind CSS 4.1.12
- **HTTP Client**: Axios 1.11.0

## Development Workflow

### Task Management & Git Integration
When todos are created for any task:
1. After each todo item is completed, create a git commit
2. Use the completed todo text as the commit message
3. Follow conventional commit format when appropriate
4. Maintain clean, atomic commits for better project history
5. After each task is completed, run `npm run build` to ensure no build errors

**IMPORTANT**: Always commit changes to git after completing each todo item. This ensures a clean, traceable history and makes reverting changes easier if needed.

### Local Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint configuration for React + TypeScript
- Follow Tailwind CSS utility-first approach
- Maintain responsive design principles
- Ensure accessibility compliance (ARIA labels, semantic HTML)

### Component Architecture
- Use native HTML elements with Tailwind CSS styling
- Create reusable authentication components
- Implement proper form validation and error handling
- Follow React best practices (hooks, functional components)
- Use TypeScript for type safety

### Authentication Focus Areas
- Login forms and validation
- Password reset functionality
- Multi-factor authentication (MFA) support
- Social login integrations
- Session management
- Security best practices (HTTPS, secure tokens)

### Design Guidelines
- Follow Tailwind CSS design system and utility classes
- Implement responsive design (mobile-first approach)
- Use consistent spacing and typography with Tailwind utilities
- Maintain high contrast ratios for accessibility
- Use Tailwind's transition and animation utilities

### Testing Strategy
- Component testing with React Testing Library
- Form validation testing
- Authentication flow testing
- Accessibility testing
- Cross-browser compatibility
- **UI Testing**: Use design-review agent along with Playwright MCP for comprehensive UI testing

### Deployment Considerations
- Microfrontend architecture compatibility
- Environment-specific configurations
- Secure API endpoint management
- Performance optimization for login flows
- Bundle size optimization

### Environment Variables
The application uses the following environment variables:
```
VITE_API_URL                    # Main API endpoint for authentication and data
VITE_BROWSER_URL                # Frontend URL for browser navigation
VITE_STUDENT_API_URL            # Student-specific API endpoint
VITE_GRAPHQL_API_URL            # GraphQL API endpoint
VITE_CKEDITOR_FILE_UPLOAD_BASE_URL  # File upload endpoint for rich text editor
VITE_S3_BUCKET                  # S3 bucket URL for static assets
VITE_DEV_TEST1_BROWSER_URL      # Development test environment 1
VITE_DEV_TEST2_BROWSER_URL      # Development test environment 2
VITE_ALLOW_ADD_TABLE            # Feature flag for table functionality
```

Variables are loaded from `.env`, `.env.local`, or `.env.[mode]` files following Vite's environment loading precedence.

### Security Requirements
- Input sanitization and validation
- Secure token storage
- CSRF protection
- Rate limiting considerations
- Audit logging for authentication events

## Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (Login, Signup, etc.)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── services/           # API service layers
```

## Integration Notes
- Designed as a microfrontend for larger applications
- API-first approach for authentication services
- Event-driven communication with parent applications
- Configurable branding and theming support