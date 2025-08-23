# GitHub Experimentations - Project Configuration

A React + Vite project for experimenting with GitHub-related UI components and features.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS with Typography plugin
- **Package Manager**: npm

## Development

### Getting Started
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

### Project Structure
- `src/` - Source code
- `public/` - Static assets
- `src/components/` - Reusable React components
- `src/pages/` - Page-level components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions

### Design System Integration
This project follows the global design principles outlined in the workspace root. Key focus areas:
- **GitHub-inspired UI patterns** - Clean, professional interface design
- **Component-first architecture** - Modular, reusable components
- **Responsive design** - Mobile-first approach with Tailwind breakpoints
- **Accessibility** - WCAG AA+ compliance for all interactive elements

### Code Quality
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper TypeScript types (when applicable)
- Maintain consistent Tailwind utility class organization
- Test components for accessibility and responsiveness

### Styling Guidelines
- Use Tailwind CSS utility classes for styling
- Follow the design system color palette and spacing scale
- Implement dark mode support where applicable
- Use semantic HTML elements for better accessibility
- Leverage Tailwind Typography plugin for content-rich sections

### Performance Considerations
- Implement code splitting for route-based components
- Optimize bundle size with proper imports
- Use React.lazy() for dynamic imports
- Implement proper loading states and error boundaries

## Local Overrides
This configuration extends the global workspace settings and may override global rules when necessary for project-specific requirements.