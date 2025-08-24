# Login Microfrontend

A React + TypeScript + Vite microfrontend application with Chakra UI for styling, focused on authentication and login functionality.

## Technology Stack
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 5.4.2 (compatible with Node 18.20.4)
- **UI Library**: Chakra UI 3.25.0
- **Animation**: Framer Motion
- **Styling**: Emotion (React + Styled)

## Development Workflow

### Task Management & Git Integration
When todos are created for any task:
1. After each todo item is completed, create a git commit
2. Use the completed todo text as the commit message
3. Follow conventional commit format when appropriate
4. Maintain clean, atomic commits for better project history

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
- Follow Chakra UI component patterns and design system
- Maintain responsive design principles
- Ensure accessibility compliance (ARIA labels, semantic HTML)

### Component Architecture
- Use Chakra UI components as building blocks
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
- Follow Chakra UI design tokens and theming
- Implement responsive design (mobile-first approach)
- Use consistent spacing and typography
- Maintain high contrast ratios for accessibility
- Create smooth animations with Framer Motion

### Testing Strategy
- Component testing with React Testing Library
- Form validation testing
- Authentication flow testing
- Accessibility testing
- Cross-browser compatibility

### Deployment Considerations
- Microfrontend architecture compatibility
- Environment-specific configurations
- Secure API endpoint management
- Performance optimization for login flows
- Bundle size optimization

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
├── services/           # API service layers
└── theme/              # Chakra UI theme customization
```

## Integration Notes
- Designed as a microfrontend for larger applications
- API-first approach for authentication services
- Event-driven communication with parent applications
- Configurable branding and theming support