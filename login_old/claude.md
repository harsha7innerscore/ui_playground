# Login Old - Modern Login Page Project

A beautiful, modern login page built with React and Tailwind CSS.

## Technology Stack

### Frontend Framework
- **React**: ^19.2.4 with TypeScript
- **TypeScript**: ^4.9.5
- **React DOM**: ^19.2.4

### Styling
- **Tailwind CSS**: ^4.1.18 (CSS-first approach)
- **PostCSS**: ^8.5.6
- **Autoprefixer**: ^10.4.24

### Build Tools
- **React Scripts**: 5.0.1
- **Node.js Target**: 18.20.4 (as per global config)

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not recommended)
npm run eject
```

## Project Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── styles/             # Additional CSS/styling files
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
├── index.tsx           # Application entry point
└── index.css           # Global styles + Tailwind imports
```

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4 which has a different setup approach:
- No config file needed (`tailwind.config.js`)
- CSS-first configuration using `@import "tailwindcss"` in `src/index.css`
- Customization through CSS custom properties and `@theme` directive
- Built-in design tokens and CSS layers

## Design Principles

- **Modern & Clean**: Emphasis on minimalist, professional aesthetics
- **S-Tier SaaS Design**: Following patterns from Stripe, Airbnb, Linear
- **Accessibility**: WCAG AA+ compliance
- **Responsive**: Mobile-first approach with proper breakpoints
- **Performance**: Optimized loading and minimal bundle size

## Development Workflow

### Design Standards
- Follow global design principles in `/.claude/design-principles.md`
- Maintain consistency with workspace design standards
- Use design-review agent for significant UI changes

### Git Workflow
- Commit after each completed todo item
- Use descriptive commit messages
- Follow conventional commit format when appropriate

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration inherited from react-app
- Component-based architecture
- Props interface definitions for all components

## Login Page Requirements

### Features
- Modern, beautiful UI design
- Clean and neat layout
- Contemporary visual styling
- Form validation (client-side)
- Responsive design across devices
- Proper accessibility features

### Visual Design
- Professional color scheme
- Modern typography
- Subtle animations and transitions
- Clean form layout
- Visual hierarchy
- Consistent spacing and alignment

## Node.js Compatibility

- **Target Version**: Node.js 18.20.4
- All dependencies verified for Node 18.x compatibility
- No breaking changes for target environment

## Integration Notes

- Part of UI Playground workspace
- Follows global development standards
- Local configuration overrides global settings where applicable
- Independent project with its own development lifecycle