# UI Playground - Global Configuration

This workspace contains multiple UI/UX projects for experimentation and development. Each project has its own subfolder with individual configurations.

## Workspace Structure
- **Root Level**: Global configurations, shared agents, and workspace-wide settings
- **Project Subfolders**: Individual projects with their own `claude.md` files
- **Conflict Resolution**: Local project `claude.md` files override global settings when conflicts arise

## Global Development Workflow

### Task Management & Git Integration
When todos are created for any task:
1. After each todo item is completed, create a git commit
2. Use the completed todo text as the commit message
3. Follow conventional commit format when appropriate
4. Maintain clean, atomic commits for better project history

### Code Quality Standards
- Follow industry best practices for all languages and frameworks
- Maintain consistent code style within each project
- Prioritize readability, maintainability, and performance
- Use appropriate linting and formatting tools
- Write self-documenting code with minimal comments unless necessary

### Design & Visual Development

#### Design Principles
- Comprehensive design checklist in `.claude/design-principles.md`
- Follow S-Tier SaaS design standards inspired by Stripe, Airbnb, Linear
- Maintain consistency across all UI projects in this workspace

#### Visual Change Verification
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use browser tools to visit each changed view
3. **Verify design compliance** - Compare against design principles
4. **Validate feature implementation** - Ensure the change fulfills requirements
5. **Check acceptance criteria** - Review provided context and requirements
6. **Capture evidence** - Take screenshots at desktop viewport (1440px)
7. **Check for errors** - Verify console messages and functionality

### Agent Configuration

#### Available Agents
- **design-review**: Comprehensive design validation and review
  - Use for significant UI/UX features
  - Before finalizing PRs with visual changes
  - Accessibility and responsiveness testing

#### Agent Usage Guidelines
- Leverage specialized agents for their specific expertise
- Design-review agent for all visual changes and UI components
- Use agents proactively to maintain code and design quality

### Development Best Practices

#### Code Organization
- Keep components modular and reusable
- Separate concerns appropriately
- Use consistent naming conventions
- Organize files logically within project structure

#### Performance Considerations
- Optimize bundle sizes and loading times
- Implement lazy loading where appropriate
- Use efficient rendering patterns
- Monitor and measure performance metrics

#### Accessibility Standards
- Follow WCAG AA+ guidelines
- Ensure keyboard navigation support
- Maintain proper color contrast ratios
- Include appropriate ARIA labels and semantic HTML

### Project-Specific Overrides
Individual projects may override these global settings by defining their own `claude.md` files. Local configurations take precedence over global ones.

### Quality Assurance
- Run linting and type checking before commits
- Test functionality across different devices and browsers
- Validate design implementation against specifications
- Ensure responsive design works across viewports

### Documentation Standards
- Maintain clear README files for each project
- Document component APIs and usage patterns
- Keep design system documentation up to date
- Include setup and development instructions