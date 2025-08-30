# Parent Test Repository

A React-based application that integrates the login-microfrontend for authentication functionality.

## Technology Stack

- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 5.4.2 (compatible with Node 18.20.4)
- **Routing**: React Router DOM 6.22.1
- **Integration**: Uses login-microfrontend for authentication

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
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript type checking
```

### Code Quality Standards

- TypeScript strict mode enabled
- Clean, maintainable component structure
- Proper error handling and loading states
- Follow React best practices (hooks, functional components)
- Use TypeScript for type safety

### Integration with Login Microfrontend

This application demonstrates integrating a microfrontend architecture by:

1. Loading the login-microfrontend UMD script at runtime
2. Exposing a global API on the window object
3. Managing authentication state in the parent application
4. Using event-based communication between parent and microfrontend
5. Providing protected routes based on authentication status

### Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components (Home, Dashboard)
├── utils/           # Utility functions
├── App.tsx          # Main application component with routing
└── main.tsx         # Application entry point
```

### Authentication Flow

1. User arrives at the application and sees the login form from the microfrontend
2. Upon successful login, the microfrontend emits an event with user data
3. Parent application stores user data in state and redirects to dashboard
4. Protected routes check authentication status before rendering
5. Logout functionality is provided by the microfrontend

### Setup Requirements

To run this application:

1. First build the login-microfrontend:
   ```
   cd ../login-microfrontend
   npm install
   npm run build
   ```

2. Then run the parent application:
   ```
   cd ../parent-test-repo
   npm install
   npm run dev
   ```

3. Access the application at http://localhost:3000

### Microfrontend Integration

The login-microfrontend is integrated via:

- A symbolic link in the public directory for development
- Dynamic script loading with proper error handling
- Event subscription for communication
- Type definitions for the global API
- Clean unsubscribe patterns to prevent memory leaks