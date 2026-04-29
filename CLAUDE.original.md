# UI Playground - Global Configuration

This workspace contains multiple UI/UX projects for experimentation and development. Each project has its own subfolder with individual configurations.

## Workspace Structure
- **Root Level**: Global configurations, shared agents, and workspace-wide settings
- **Project Subfolders**: Individual projects with their own `claude.md` files
- **Conflict Resolution**: Local project `claude.md` files override global settings when conflicts arise

## Global Development Workflow

### Task Management & Git Integration
When todos are created for any task:
1. After each todo item is completed, create a git commit immediately
2. Use the completed todo text as the commit message
3. Follow conventional commit format when appropriate
4. Maintain clean, atomic commits for better project history
5. NEVER batch multiple completed todos before committing - commit after each completion

### Node.js Compatibility Requirements
- **Target Node Version**: Node.js 18.20.4 (or latest stable 18.x)
- All frameworks, build tools, and dependencies MUST be compatible with the target Node version
- When version conflicts arise, downgrade to compatible versions rather than upgrading Node
- Always verify compatibility before installing new packages
- Document version constraints in project-specific claude.md files

### Project Creation Standards
- **MANDATORY**: Every new repository/project MUST have its own `claude.md` file
- Local `claude.md` files should include:
  - Technology stack and version constraints
  - Development commands and workflows
  - Project-specific coding standards
  - Architecture decisions and patterns
  - Integration requirements (if microfrontend/microservice)
- Create the local `claude.md` immediately after project initialization

### Context Management
- ALWAYS read and consider both global (`/CLAUDE.md`) AND local (`/project/claude.md`) files for each task
- Local project configurations override global settings when conflicts exist
- Maintain awareness of both global workspace standards and project-specific requirements
- Reference both files when making architectural or technical decisions

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