# UI Playground - Global Configuration

Workspace: multiple UI/UX projects. Each project has own subfolder + configs.

## Workspace Structure
- **Root Level**: Global configs, shared agents, workspace-wide settings
- **Project Subfolders**: Individual projects with own `claude.md` files
- **Conflict Resolution**: Local `claude.md` overrides global on conflict

## Global Development Workflow

### Task Management & Git Integration
When todos created:
1. After each todo completed, commit immediately
2. Use completed todo text as commit message
3. Follow conventional commit format when appropriate
4. Atomic commits for clean history
5. NEVER batch multiple completed todos before committing — commit after each

### Node.js Compatibility Requirements
- **Target Node Version**: Node.js 18.20.4 (or latest stable 18.x)
- All frameworks, build tools, deps MUST be compatible with target Node version
- On version conflict, downgrade — don't upgrade Node
- Verify compatibility before installing packages
- Document version constraints in project-specific claude.md

### Project Creation Standards
- **MANDATORY**: Every new repo/project MUST have own `claude.md`
- Local `claude.md` must include:
  - Tech stack + version constraints
  - Dev commands and workflows
  - Project-specific coding standards
  - Architecture decisions and patterns
  - Integration requirements (if microfrontend/microservice)
- Create local `claude.md` immediately after project init

### Context Management
- ALWAYS read both global (`/CLAUDE.md`) AND local (`/project/claude.md`) per task
- Local overrides global on conflict
- Reference both when making architectural/technical decisions

### Code Quality Standards
- Follow best practices for all languages/frameworks
- Consistent code style per project
- Prioritize readability, maintainability, performance
- Use appropriate linting/formatting tools
- Self-documenting code; minimal comments

### Design & Visual Development

#### Design Principles
- Checklist in `.claude/design-principles.md`
- S-Tier SaaS standards: Stripe, Airbnb, Linear
- Consistency across all UI projects

#### Visual Change Verification
IMMEDIATELY after any front-end change:
1. **Identify what changed** — review modified components/pages
2. **Navigate to affected pages** — visit each changed view in browser
3. **Verify design compliance** — compare against design principles
4. **Validate feature** — ensure change fulfills requirements
5. **Check acceptance criteria** — review context and requirements
6. **Capture evidence** — screenshot at desktop viewport (1440px)
7. **Check for errors** — verify console messages and functionality

### Agent Configuration

#### Available Agents
- **design-review**: Comprehensive design validation
  - Use for significant UI/UX features
  - Before finalizing PRs with visual changes
  - Accessibility + responsiveness testing

#### Agent Usage Guidelines
- Use specialized agents for their specific expertise
- design-review for all visual changes and UI components
- Use agents proactively to maintain quality

### Development Best Practices

#### Code Organization
- Modular, reusable components
- Separate concerns appropriately
- Consistent naming conventions
- Logical file organization

#### Performance Considerations
- Optimize bundle sizes + load times
- Lazy loading where appropriate
- Efficient rendering patterns
- Monitor and measure perf metrics

#### Accessibility Standards
- WCAG AA+ guidelines
- Keyboard navigation support
- Proper color contrast ratios
- ARIA labels + semantic HTML

### Project-Specific Overrides
Local `claude.md` overrides global. Local takes precedence.

### Quality Assurance
- Lint + type-check before commits
- Test across devices and browsers
- Validate design against specs
- Verify responsive design across viewports

### Documentation Standards
- Clear README per project
- Document component APIs and usage
- Keep design system docs current
- Include setup + dev instructions