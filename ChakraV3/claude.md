# ChakraV3 Project

This project is a React application built with Vite, Chakra UI v3, and Storybook. It follows an atomic design pattern for components.

## Project Structure

- `src/components/atoms/` - Basic building blocks (buttons, inputs, etc.)
- `src/components/molecules/` - Groups of atoms functioning together
- `src/components/organisms/` - Complex components made up of molecules and/or atoms

## Technology Stack

- **React 19+**: Core UI library
- **TypeScript**: For type safety
- **Vite 7+**: Build tool and development server
- **Chakra UI v3**: UI component library
- **Storybook 9+**: Component development and documentation

## Node.js Version Requirements

- **Required Node.js Version**: 20.18.0 or higher
- **Required NPM Version**: 10.7.0 or higher

## Development Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run storybook`: Start Storybook development environment
- `npm run build-storybook`: Build Storybook for static deployment

## Project Conventions

### Component Structure

All components should follow this structure:
- `ComponentName.tsx`: Component implementation
- `index.ts`: Export file
- `ComponentName.stories.tsx`: Storybook documentation

### Coding Standards

1. Use TypeScript for all files
2. Use functional components with hooks
3. Export component types for better reusability
4. Document components with JSDoc comments
5. Create stories for all components

### Design System Guidelines

1. Use Chakra UI theme tokens for consistency
2. Avoid custom CSS outside the Chakra system
3. Make components responsive by default
4. Follow accessibility best practices

## Storybook Guidelines

1. Document all props in stories
2. Include stories for all component variations
3. Use component controls to demonstrate different states
4. Organize stories by atomic design categories (atoms, molecules, organisms)

## Accessibility Standards

1. Use semantic HTML elements
2. Include ARIA attributes when necessary
3. Ensure keyboard navigation works
4. Maintain appropriate color contrast
5. Test with screen readers

## Integration with Global Configuration

This project adheres to the global UI playground configuration while maintaining its specific requirements.

## Version Compatibility

The project requires specific versions of dependencies:
- React: ^19.1.1
- Chakra UI: ^3.27.0
- TypeScript: ^5.9.2
- Vite: ^7.1.6